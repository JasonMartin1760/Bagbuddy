import {useId, useRef, useState} from 'react';
import type {OptimisticCartLineInput} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {ADDITIONAL_FEES, formatUsd} from '~/config/pricing';
import {ZipChecker} from '~/components/bagbuddy/ZipChecker';

const MAX_BAGS = 10;

/**
 * Bag page buy box: quantity, "Buy now" and "Add to cart". Either button
 * opens a short "before you continue" step: an optional zip check (same
 * logic as the pickup flow) and a note about the extra disposal fees at
 * pickup. Nothing is required; the big yellow button goes straight on
 * (to Shopify checkout for Buy now, or into the cart for Add to cart).
 */
export function BagBuyBox({
  variant,
  unitPrice,
}: {
  variant:
    | (NonNullable<OptimisticCartLineInput['selectedVariant']> & {
        id: string;
        availableForSale: boolean;
      })
    | null
    | undefined;
  unitPrice: number | null;
}) {
  const {open} = useAside();
  const [quantity, setQuantity] = useState(1);
  const [mode, setMode] = useState<'checkout' | 'cart'>('checkout');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  function openStep(next: 'checkout' | 'cart') {
    setMode(next);
    dialogRef.current?.showModal();
  }
  const available = !!variant?.availableForSale;

  const lines: OptimisticCartLineInput[] = variant
    ? [{merchandiseId: variant.id, quantity, selectedVariant: variant}]
    : [];
  const total =
    unitPrice !== null ? ` · ${formatUsd(unitPrice * quantity)}` : '';

  return (
    <div className="product-form bb-buybox">
      <div className="bb-buybox__qty-row">
        <span className="bb-buybox__qty-label" id="bag-qty-label">
          Quantity
        </span>
        <div
          className="bb-qty bb-qty--light"
          role="group"
          aria-labelledby="bag-qty-label"
        >
          <button
            type="button"
            aria-label="Remove one bag"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span aria-live="polite">{quantity}</span>
          <button
            type="button"
            aria-label="Add one bag"
            disabled={quantity >= MAX_BAGS}
            onClick={() => setQuantity((q) => Math.min(MAX_BAGS, q + 1))}
          >
            +
          </button>
        </div>
      </div>
      <div className="bb-buybox__actions">
        <button
          type="button"
          className="bb-btn bb-btn--yellow bb-btn--lg bb-buybox__buy"
          disabled={!available}
          onClick={() => openStep('checkout')}
        >
          {available ? `Buy now${total}` : 'Sold out'}
        </button>
        <button
          type="button"
          className="bb-btn bb-btn--outline bb-btn--lg bb-buybox__add"
          disabled={!available}
          onClick={() => openStep('cart')}
        >
          Add to cart
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="bb-fees-step bb-bag-step"
        aria-labelledby={titleId}
      >
        <div className="bb-fees-step__inner">
          <h2 id={titleId} className="bb-fees-step__title">
            Before you continue
          </h2>
          <ZipChecker
            heading="Make sure we serve your area"
            headingLevel="h3"
            helpText="Optional: enter your zip code to see your pickup price."
            variant="flow"
            className="bb-zip--small"
          />
          <div className="bb-bag-step__fees">
            <h3>Some items have extra disposal fees at pickup</h3>
            <ul>
              {ADDITIONAL_FEES.map((fee) => (
                <li key={fee.kind}>
                  {fee.label}:{' '}
                  <strong>
                    {fee.price !== null ? formatUsd(fee.price) : '—'}
                  </strong>{' '}
                  each
                </li>
              ))}
            </ul>
          </div>
          <div className="bb-fees-step__actions">
            <AddToCartButton
              className="bb-btn bb-btn--yellow bb-btn--lg"
              disabled={!available}
              lines={lines}
              redirectToCheckout={mode === 'checkout'}
              pendingLabel={
                mode === 'checkout' ? 'Going to checkout…' : 'Adding…'
              }
              onClick={() => {
                if (mode === 'cart') {
                  dialogRef.current?.close();
                  open('cart');
                }
              }}
            >
              {mode === 'checkout' ? 'Continue to checkout' : 'Add to cart'}
            </AddToCartButton>
            <button
              type="button"
              className="bb-bag-step__back"
              onClick={() => dialogRef.current?.close()}
            >
              Go back
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
