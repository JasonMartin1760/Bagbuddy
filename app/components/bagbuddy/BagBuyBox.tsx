import {useRef, useState} from 'react';
import type {OptimisticCartLineInput} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {formatUsd} from '~/config/pricing';
import {ZipChecker} from '~/components/bagbuddy/ZipChecker';

const MAX_BAGS = 10;

/**
 * Bag page buy box: quantity, "Buy now" and "Add to cart". Either button
 * opens a small sheet: the big yellow button that goes straight on (Shopify
 * checkout for Buy now, the cart for Add to cart), an optional one-line zip
 * check (same logic as the pickup flow) and a short red note about extra
 * disposal charges. Nothing is required.
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

      {/* Compact sheet: the yellow button comes first so it's visible right
          away (and above the iOS keyboard); the zip check is optional. */}
      <dialog
        ref={dialogRef}
        className="bb-bag-sheet"
        aria-label={mode === 'checkout' ? 'Continue to checkout' : 'Add to cart'}
      >
        <div className="bb-bag-sheet__inner">
          <AddToCartButton
            className="bb-btn bb-btn--yellow bb-btn--lg bb-bag-sheet__go"
            disabled={!available}
            lines={lines}
            redirectToCheckout={mode === 'checkout'}
            pendingLabel={mode === 'checkout' ? 'Going to checkout…' : 'Adding…'}
            onClick={() => {
              if (mode === 'cart') {
                dialogRef.current?.close();
                open('cart');
              }
            }}
          >
            {mode === 'checkout' ? 'Continue to checkout' : 'Add to cart'}
          </AddToCartButton>
          <ZipChecker
            heading="Want to make sure we serve your area before buying a bag?"
            variant="inline"
          />
          <p className="bb-bag-sheet__note">
            Some items have extra disposal charges, such as mattresses and large
            electronics.
          </p>
          <button
            type="button"
            className="bb-bag-sheet__close"
            onClick={() => dialogRef.current?.close()}
          >
            Go back
          </button>
        </div>
      </dialog>
    </div>
  );
}
