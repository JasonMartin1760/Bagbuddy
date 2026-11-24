import {useId, useRef, useState} from 'react';
import type {OptimisticCartLineInput} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {ADDITIONAL_FEES, formatUsd} from '~/config/pricing';
import type {FeeVariant} from '~/lib/feeVariants';

type MainVariant = {
  id: string;
  availableForSale: boolean;
  selectedVariant?: OptimisticCartLineInput['selectedVariant'];
};

const MAX_PER_FEE = 10;
const NOT_ALLOWED_ID = 'not-allowed';
const NOT_ALLOWED_HREF = `/#${NOT_ALLOWED_ID}`;

/** Short fee labels for the pickup flow (prices come from pricing.ts). */
const SHORT_FEE_LABEL: Record<string, string> = {
  'electronics-addon': 'TV / large electronic',
  'mattress-addon': 'Mattress / box spring',
};

/**
 * Homepage-only pickup flow, screens 2 and 3 (screen 1 is the zip check on
 * the page). One pop-up, one job per screen:
 *   2. "Anything extra in the bag?" (fees, only if they apply) -> Continue
 *   3. "One last check" (required hazmat checkbox + total) -> Go to checkout
 * Adds the pickup and any fee lines to the cart and goes straight to Shopify
 * checkout. The pickup line records "Add-on items reviewed" and "No hazardous
 * materials confirmed", same as the older fees step.
 */
export function PickupSteps({
  mainVariant,
  feeVariants,
  pickupPrice,
  afterStart,
}: {
  mainVariant: MainVariant;
  feeVariants: readonly FeeVariant[];
  /** Area pickup price shown in the total line. */
  pickupPrice: number | null;
  /** Shown directly below the Continue button (specific-day contact). */
  afterStart?: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const hazardId = useId();
  const [screen, setScreen] = useState<2 | 3>(2);
  const [noHazards, setNoHazards] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  function open() {
    setScreen(2);
    setNoHazards(false);
    dialogRef.current?.showModal();
  }

  function setQuantity(id: string, next: number) {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, Math.min(MAX_PER_FEE, next)),
    }));
  }

  const fees = ADDITIONAL_FEES.map((fee) => {
    const variant = feeVariants.find((v) => v.kind === fee.kind);
    const qty = variant ? (quantities[variant.id] ?? 0) : 0;
    return {fee, variant, qty};
  });
  const extras = fees.reduce(
    (sum, {fee, qty}) => sum + (fee.price ?? 0) * qty,
    0,
  );

  const lines: OptimisticCartLineInput[] = [
    {
      merchandiseId: mainVariant.id,
      quantity: 1,
      ...(mainVariant.selectedVariant
        ? {selectedVariant: mainVariant.selectedVariant}
        : {}),
      attributes: [
        {key: 'Add-on items reviewed', value: 'Yes'},
        {key: 'No hazardous materials confirmed', value: 'Yes'},
      ],
    },
    ...fees
      .filter(({variant, qty}) => variant && qty > 0)
      .map(({variant, qty}) => ({
        merchandiseId: variant!.id,
        quantity: qty,
      })),
  ];

  return (
    <div className="product-form bb-buy">
      <button
        type="button"
        className="bb-btn bb-btn--yellow bb-btn--lg bb-buy__start"
        disabled={!mainVariant.availableForSale}
        onClick={open}
      >
        {mainVariant.availableForSale ? 'Continue' : 'Not available right now'}
      </button>
      {afterStart ?? null}

      <dialog
        ref={dialogRef}
        className="bb-fees-step bb-pickup-steps"
        aria-labelledby={titleId}
        onClose={() => setNoHazards(false)}
      >
        {screen === 2 ? (
          <div className="bb-fees-step__inner">
            <p className="bb-fees-step__eyebrow">Step 2 of 3</p>
            <h2 id={titleId} className="bb-fees-step__title">
              Anything extra in the bag?
            </h2>
            <p>Only if it applies. Most bags have none.</p>
            <ul className="bb-fees-step__list">
              {fees.map(({fee, variant, qty}) => {
                const label = SHORT_FEE_LABEL[fee.kind] ?? fee.label;
                return (
                  <li key={fee.kind} className="bb-fees-step__item">
                    <div>
                      <strong className="bb-fees-step__label">{label}</strong>
                      <span className="bb-fees-step__price">
                        {fee.price !== null
                          ? `${formatUsd(fee.price)} each`
                          : '—'}
                      </span>
                    </div>
                    {variant?.availableForSale ? (
                      <div
                        className="bb-qty"
                        role="group"
                        aria-label={`${label} quantity`}
                      >
                        <button
                          type="button"
                          aria-label={`Remove one ${label}`}
                          disabled={qty === 0}
                          onClick={() => setQuantity(variant.id, qty - 1)}
                        >
                          −
                        </button>
                        <span aria-live="polite">{qty}</span>
                        <button
                          type="button"
                          aria-label={`Add one ${label}`}
                          disabled={qty >= MAX_PER_FEE}
                          onClick={() => setQuantity(variant.id, qty + 1)}
                        >
                          +
                        </button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <div className="bb-fees-step__actions">
              <button
                type="button"
                className="bb-btn bb-btn--yellow bb-btn--lg"
                onClick={() => setScreen(3)}
              >
                Continue
              </button>
            </div>
            <button
              type="button"
              className="bb-pickup-steps__back"
              onClick={() => dialogRef.current?.close()}
            >
              Back
            </button>
          </div>
        ) : (
          <div className="bb-fees-step__inner">
            <p className="bb-fees-step__eyebrow">Step 3 of 3</p>
            <h2 id={titleId} className="bb-fees-step__title">
              One last check
            </h2>
            <label className="bb-fees-step__ack" htmlFor={hazardId}>
              <input
                id={hazardId}
                type="checkbox"
                checked={noHazards}
                onChange={(event) => setNoHazards(event.target.checked)}
              />
              <span>My bag has no hazardous materials.</span>
            </label>
            <p className="bb-pickup-steps__allowed">
              <a
                href={NOT_ALLOWED_HREF}
                onClick={() => dialogRef.current?.close()}
              >
                See what&rsquo;s not allowed
              </a>
            </p>
            {pickupPrice !== null ? (
              <p className="bb-pickup-steps__total">
                Pickup {formatUsd(pickupPrice)} + extras {formatUsd(extras)} ={' '}
                <strong>{formatUsd(pickupPrice + extras)}</strong>
              </p>
            ) : null}
            <div className="bb-fees-step__actions">
              <AddToCartButton
                className="bb-btn bb-btn--yellow bb-btn--lg"
                disabled={!noHazards || !mainVariant.availableForSale}
                lines={lines}
                redirectToCheckout
                pendingLabel="Sending you to checkout…"
              >
                Go to checkout
              </AddToCartButton>
            </div>
            <button
              type="button"
              className="bb-pickup-steps__back"
              onClick={() => setScreen(2)}
            >
              Back
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}
