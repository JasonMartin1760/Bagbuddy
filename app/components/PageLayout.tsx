import {Await} from 'react-router';
import {lazy, Suspense} from 'react';
import type {CartApiQueryFragment, HeaderQuery} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';

/*
 * The cart and search drawers are closed (invisible) when a page loads, so
 * their code is split out and only loaded once the page is up and idle, or
 * when a drawer opens (see Aside `deferContent`). This keeps it off the
 * critical path of every page without changing anything on screen.
 */
const CartMain = lazy(() =>
  import('~/components/CartMain').then((m) => ({default: m.CartMain})),
);
const SearchAsideContent = lazy(() =>
  import('~/components/SearchAsideContent').then((m) => ({
    default: m.SearchAsideContent,
  })),
);

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside />
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      <main>{children}</main>
      <Footer header={header} publicStoreDomain={publicStoreDomain} />
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="CART" deferContent>
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  return (
    <Aside type="search" heading="SEARCH" deferContent>
      <Suspense fallback={null}>
        <SearchAsideContent />
      </Suspense>
    </Aside>
  );
}

function MobileMenuAside() {
  return (
    <Aside type="mobile" heading="MENU">
      <HeaderMenu viewport="mobile" />
    </Aside>
  );
}
