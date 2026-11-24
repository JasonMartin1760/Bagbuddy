import {Suspense} from 'react';
import {Await, Link, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CallButton} from '~/components/bagbuddy/ContactButton';
import {NAV_ITEMS, SITE} from '~/config/site';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

/**
 * Site-wide header (Jason's layout):
 * - row 1: the full logo (with its baked-in tagline), centered
 * - row 2: phone number on the left, cart + menu side by side on the right;
 *   on desktop the nav links sit in the middle of this row
 */
export function Header({cart}: HeaderProps) {
  return (
    <header className="header bb-header">
      <Link prefetch="intent" to="/" className="bb-header__logo">
        <picture>
          <source srcSet="/images/bagbuddy-logo-color.webp" type="image/webp" />
          <img
            src="/images/bagbuddy-logo-color.png"
            alt={`${SITE.name}: ${SITE.tagline}`}
            width={640}
            height={305}
          />
        </picture>
      </Link>
      <CallButton className="bb-header__call" />
      <HeaderMenu viewport="desktop" />
      <div className="bb-header__actions">
        <CartToggle cart={cart} />
        <HeaderMenuMobileToggle />
      </div>
    </header>
  );
}

/**
 * Site navigation from app/config/site.ts (Buy Bags, Book a Pickup,
 * Services that we offer, About, Contact).
 */
export function HeaderMenu({viewport}: {viewport: Viewport}) {
  const {close} = useAside();
  return (
    <nav
      className={`header-menu-${viewport} bb-nav bb-nav--${viewport}`}
      aria-label="Main"
    >
      {viewport === 'mobile' && (
        <NavLink end onClick={close} prefetch="intent" to="/">
          Home
        </NavLink>
      )}
      {NAV_ITEMS.map((item) =>
        item.to.includes('#') ? (
          <Link
            className="bb-nav__item"
            key={item.to}
            onClick={close}
            to={item.to}
          >
            {item.label}
          </Link>
        ) : (
          <NavLink
            className="bb-nav__item"
            end
            key={item.to}
            onClick={close}
            prefetch="intent"
            to={item.to}
          >
            {item.label}
          </NavLink>
        ),
      )}
      {viewport === 'mobile' && <CallButton className="bb-nav__call" />}
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset bb-header__menu"
      onClick={() => open('mobile')}
      aria-label="Open menu"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
        <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
      </svg>
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      className="bb-header__cart"
      aria-label={`Cart${count ? `, ${count} items` : ''}`}
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM5.2 4l.94 2H21l-3.6 7.2a2 2 0 0 1-1.75 1.05H8.1l-.9 1.65L7.2 16H19v2H7a2 2 0 0 1-1.76-2.95l1.35-2.45L3 4H1V2h3.27z"
        />
      </svg>
      {count ? <span className="bb-header__cart-count">{count}</span> : null}
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}
