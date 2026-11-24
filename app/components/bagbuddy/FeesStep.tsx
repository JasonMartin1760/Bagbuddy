import {useId, useRef, useState, type ReactNode} from 'react';
import type {OptimisticCartLineInput} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {ADDITIONAL_FEES, formatUsd} from '~/config/pricing';
import type {FeeVariant} from '~/lib/feeVariants';

export type {FeeVariant};

type MainVariant = {
  id: string;
  availableForSale: boolean;
  selectedVariant?: OptimisticCartLineInput['selectedVariant'];
};

const MAX_PER_FEE = 10;
const NOT_ALLOWED_ID = 'not-allowed';
const NOT_ALLOWED_HREF = `/#${NOT_ALLOWED_ID}`;

/**
 * Required add-ons step for scheduling a pickup. The main button opens a
 * step that lists the extra item charges (large electronic devices,
 * mattresses / box springs) with quantities. The shopper must confirm their
 * dumpster bag has no hazardous materials before anything goes into the
 * cart. The chosen fees are added to the cart as real line items with the
 * pickup, and the pickup line records "Add-on items reviewed: Yes" (they went
 * through this step) and "No hazardous materials confirmed: Yes".
 *
 * - `goTo="cart"`: adds the lines and opens the cart drawer.
 * - `goTo="checkout"`: adds the lines and sends the shopper straight to
 *   Shopify checkout (pickup landing page).
 */
export function FeesStepPurchase({
  mainVariant,
  feeVariants,
  mainAttributeKey,
  startLabel,
  submitLabel,
  submittingLabel,
  intro,
  subtext,
  stepLabel,
  note,
  beforeStart,
  goTo = 'cart',
  startClassName = 'bb-btn bb-btn--yellow bb-btn--lg bb-buy__start',
}: {
  mainVariant: MainVariant | null | undefined;
  feeVariants: readonly FeeVariant[];
  /** Line attribute recorded on the bag / pickup line once fees are reviewed. */
  mainAttributeKey: string;
  startLabel: string;
  submitLabel: string;
  submittingLabel?: string;
  intro: string;
  /** Line under the heading. */
  subtext?: string;
  /** Small label above the heading, e.g. "Step 2 of 3" in the pickup flow. */
  stepLabel?: string;
  note?: string;
  /** Optional content shown directly above the start button. Off by default. */
  beforeStart?: ReactNode;
  goTo?: 'cart' | 'checkout';
  startClassName?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const hazardId = useId();
  const {open} = useAside();
  const [noHazards, setNoHazards] = useState(false);
  const ready = noHazards;
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const available = !!mainVariant?.availableForSale;

  function openStep() {
    setNoHazards(false);
    dialogRef.current?.showModal();
  }

  function setQuantity(id: string, next: number) {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, Math.min(MAX_PER_FEE, next)),
    }));
  }

  const lines: OptimisticCartLineInput[] = mainVariant
    ? [
        {
          merchandiseId: mainVariant.id,
          quantity: 1,
          ...(mainVariant.selectedVariant
            ? {selectedVariant: mainVariant.selectedVariant}
            : {}),
          attributes: [
            {key: mainAttributeKey, value: 'Yes'},
            {key: 'No hazardous materials confirmed', value: 'Yes'},
          ],
        },
        ...feeVariants
          .filter((fee) => (quantities[fee.id] ?? 0) > 0)
          .map((fee) => ({
            merchandiseId: fee.id,
            quantity: quantities[fee.id] ?? 0,
          })),
      ]
    : [];

  return (
    <div className="product-form bb-buy">
      {beforeStart ?? null}
      <button
        type="button"
        className={startClassName}
        disabled={!available}
        onClick={openStep}
      >
        {available ? startLabel : 'Not available right now'}
      </button>
      {note ? <p className="bb-buy__note">{note}</p> : null}

      <dialog
        ref={dialogRef}
        className="bb-fees-step"
        aria-labelledby={titleId}
        onClose={() => setNoHazards(false)}
      >
        <div className="bb-fees-step__inner">
          {stepLabel ? (
            <p className="bb-fees-step__eyebrow">{stepLabel}</p>
          ) : null}
          <h2 id={titleId} className="bb-fees-step__title">
            Extra item charges
          </h2>
          {subtext ? <p className="bb-fees-step__sub">{subtext}</p> : null}
          <p>{intro}</p>
          <ul className="bb-fees-step__list">
            {ADDITIONAL_FEES.map((fee) => {
              const variant = feeVariants.find((v) => v.kind === fee.kind);
              const qty = variant ? (quantities[variant.id] ?? 0) : 0;
              return (
                <li key={fee.kind} className="bb-fees-step__item">
                  <div>
                    <strong className="bb-fees-step__label">{fee.label}</strong>
                    <span className="bb-fees-step__price">
                      {fee.price !== null ? formatUsd(fee.price) : '—'}{' '}
                      {fee.unit}
                    </span>
                  </div>
                  {variant?.availableForSale ? (
                    <div
                      className="bb-qty"
                      role="group"
                      aria-label={`${fee.label} quantity`}
                    >
                      <button
                        type="button"
                        aria-label={`Remove one ${fee.label}`}
                        disabled={qty === 0}
                        onClick={() => setQuantity(variant.id, qty - 1)}
                      >
                        −
                      </button>
                      <span aria-live="polite">{qty}</span>
                      <button
                        type="button"
                        aria-label={`Add one ${fee.label}`}
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
          <label className="bb-fees-step__ack" htmlFor={hazardId}>
            <input
              id={hazardId}
              type="checkbox"
              checked={noHazards}
              onChange={(event) => setNoHazards(event.target.checked)}
            />
            <span>
              My dumpster bag does not contain hazardous materials (
              <a
                href={NOT_ALLOWED_HREF}
                onClick={(event) => {
                  // Same page: close the step and scroll to the list.
                  const target = document.getElementById(NOT_ALLOWED_ID);
                  if (!target) return;
                  event.preventDefault();
                  dialogRef.current?.close();
                  target.scrollIntoView({behavior: 'smooth', block: 'start'});
                }}
              >
                see what&rsquo;s not allowed
              </a>
              ).
            </span>
          </label>
          <div className="bb-fees-step__actions">
            <AddToCartButton
              className="bb-btn bb-btn--yellow bb-btn--lg"
              disabled={!ready || !available}
              lines={lines}
              redirectToCheckout={goTo === 'checkout'}
              pendingLabel={
                submittingLabel ??
                (goTo === 'checkout' ? 'Sending you to checkout…' : 'Adding…')
              }
              onClick={() => {
                if (goTo === 'cart') {
                  dialogRef.current?.close();
                  open('cart');
                }
              }}
            >
              {submitLabel}
            </AddToCartButton>
            <button
              type="button"
              className="bb-btn bb-btn--outline"
              onClick={() => dialogRef.current?.close()}
            >
              Go back
            </button>
          </div>
          {!ready ? (
            <p className="bb-fees-step__hint">
              Tick the box above to continue.
            </p>
          ) : null}
        </div>
      </dialog>
    </div>
  );
}
