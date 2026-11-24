import {useState} from 'react';
import type {OptimisticCartLineInput} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {formatUsd} from '~/config/pricing';

const MAX_BAGS = 10;

/**
 * Bag page buy box: quantity, "Buy now" (straight to Shopify checkout) and
 * "Add to cart" (opens the cart drawer). No extra steps: the extra item
 * fees are handled when the pickup is scheduled.
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
        <AddToCartButton
          className="bb-btn bb-btn--yellow bb-btn--lg bb-buybox__buy"
          disabled={!available}
          lines={lines}
          redirectToCheckout
          pendingLabel="Going to checkout…"
        >
          {available ? `Buy now${total}` : 'Sold out'}
        </AddToCartButton>
        <AddToCartButton
          className="bb-btn bb-btn--outline bb-btn--lg bb-buybox__add"
          disabled={!available}
          lines={lines}
          onClick={() => open('cart')}
        >
          Add to cart
        </AddToCartButton>
      </div>
    </div>
  );
}
