import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

type CartFetcher = FetcherWithComponents<{
  errors?: Array<{message?: string}>;
}>;

export function AddToCartButton({
  analytics,
  children,
  className,
  disabled,
  lines,
  onClick,
  pendingLabel = 'Adding…',
  redirectToCheckout = false,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  pendingLabel?: string;
  /** After adding, go straight to Shopify checkout (see routes/cart.tsx). */
  redirectToCheckout?: boolean;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: CartFetcher) => {
        const busy = fetcher.state !== 'idle';
        const errors = fetcher.data?.errors?.filter((error) => error.message);
        return (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            {redirectToCheckout ? (
              <input type="hidden" name="redirectTo" value="checkout" />
            ) : null}
            <button
              className={className}
              type="submit"
              onClick={onClick}
              disabled={!!disabled || busy || lines.length === 0}
            >
              {busy ? pendingLabel : children}
            </button>
            {errors?.length ? (
              <p className="bb-cart-error" role="alert">
                {errors.map((error) => error.message).join(' ')}
              </p>
            ) : null}
          </>
        );
      }}
    </CartForm>
  );
}
