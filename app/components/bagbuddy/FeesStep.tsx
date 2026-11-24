import {useId, useRef, useState} from 'react';
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
 * step that lists the extra item charges that apply at pickup (large
 * electronic devices, mattresses / box springs) with quantities. The
 * shopper must tick "I understand" and confirm the bag has no hazardous
 * materials before anything goes into the cart, so the step can't be
 * skipped. The chosen fees are added to the cart as real line items with
 * the pickup, and the pickup line records both confirmations.
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
  note,
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
  note?: string;
  goTo?: 'cart' | 'checkout';
  startClassName?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const ackId = useId();
  const hazardId = useId();
  const {open} = useAside();
  const [acknowledged, setAcknowledged] = useState(false);
  const [noHazards, setNoHazards] = useState(false);
  const ready = acknowledged && noHazards;
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const available = !!mainVariant?.availableForSale;

  function openStep() {
    setAcknowledged(false);
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
        onClose={() => {
          setAcknowledged(false);
          setNoHazards(false);
        }}
      >
        <div className="bb-fees-step__inner">
          <p className="bb-fees-step__eyebrow">Step 2 of 3</p>
          <h2 id={titleId} className="bb-fees-step__title">
            Extra item charges at pickup
          </h2>
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
          <label className="bb-fees-step__ack" htmlFor={ackId}>
            <input
              id={ackId}
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
            />
            <span>
              I understand that large electronic devices and mattresses or box
              springs in my bag are charged at pickup, one fee per item.
            </span>
          </label>
          <label className="bb-fees-step__ack" htmlFor={hazardId}>
            <input
              id={hazardId}
              type="checkbox"
              checked={noHazards}
              onChange={(event) => setNoHazards(event.target.checked)}
            />
            <span>
              I confirm my bag contains no hazardous materials (
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
              Tick both boxes above to continue.
            </p>
          ) : null}
        </div>
      </dialog>
    </div>
  );
}
