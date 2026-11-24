import {useEffect, useId, useRef, useState} from 'react';
import type {OptimisticCartLineInput} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {ADDITIONAL_FEES, formatUsd, type ProductKind} from '~/config/pricing';

type BagVariant = OptimisticCartLineInput['selectedVariant'] & {
  id: string;
  availableForSale: boolean;
};

export interface FeeVariant {
  kind: ProductKind;
  id: string;
  availableForSale: boolean;
}

const MAX_PER_FEE = 10;

/**
 * Buying a bag is a two-step flow: "Add to cart" opens a required fees step
 * that lists the additional item charges (large electronic devices,
 * mattresses / box springs). The shopper can add the fee items there and
 * must tick "I understand" before the bag goes into the cart, so the fees
 * step can't be skipped.
 */
export function BagPurchaseForm({
  bagVariant,
  feeVariants,
}: {
  bagVariant: BagVariant | null | undefined;
  feeVariants: readonly FeeVariant[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const ackId = useId();
  const {open} = useAside();
  const [acknowledged, setAcknowledged] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const available = !!bagVariant?.availableForSale;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const reset = () => setAcknowledged(false);
    dialog.addEventListener('close', reset);
    return () => dialog.removeEventListener('close', reset);
  }, []);

  function openFeesStep() {
    setAcknowledged(false);
    dialogRef.current?.showModal();
  }

  function setQuantity(id: string, next: number) {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, Math.min(MAX_PER_FEE, next)),
    }));
  }

  const lines: OptimisticCartLineInput[] = bagVariant
    ? [
        {
          merchandiseId: bagVariant.id,
          quantity: 1,
          selectedVariant: bagVariant,
          attributes: [{key: 'Additional fees reviewed', value: 'Yes'}],
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
        className="bb-btn bb-btn--yellow bb-btn--lg bb-buy__start"
        disabled={!available}
        onClick={openFeesStep}
      >
        {available ? 'Add to cart' : 'Sold out'}
      </button>
      <p className="bb-buy__note">
        Next: review the additional item charges before your bag is added.
      </p>

      <dialog
        ref={dialogRef}
        className="bb-fees-step"
        aria-labelledby={titleId}
      >
        <div className="bb-fees-step__inner">
          <p className="bb-fees-step__eyebrow">Step 2 of 2</p>
          <h2 id={titleId} className="bb-fees-step__title">
            Additional item charges
          </h2>
          <p>
            Some items cost extra to dispose of. If any of these will go in your
            bag, add one fee for each item now.
          </p>
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
              springs in my bag cost extra, one fee per item.
            </span>
          </label>
          <div className="bb-fees-step__actions">
            <AddToCartButton
              className="bb-btn bb-btn--yellow bb-btn--lg"
              disabled={!acknowledged || !available}
              lines={lines}
              onClick={() => {
                dialogRef.current?.close();
                open('cart');
              }}
            >
              Add to cart
            </AddToCartButton>
            <button
              type="button"
              className="bb-btn bb-btn--outline"
              onClick={() => dialogRef.current?.close()}
            >
              Go back
            </button>
          </div>
          {!acknowledged ? (
            <p className="bb-fees-step__hint">
              Tick the box above to continue.
            </p>
          ) : null}
        </div>
      </dialog>
    </div>
  );
}
