import type {Route} from './+types/collections.all';
import {Link, useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem, ProductPlaceholderImage} from '~/components/ProductItem';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import {
  SHOP_PRODUCT_KINDS,
  PRODUCT_PRICING,
  findProductPricing,
  formatUsd,
  type ShopProductKind,
} from '~/config/pricing';
import {BOOK_PICKUP_PATH, pageTitle} from '~/config/site';

export const meta: Route.MetaFunction = () => {
  return [{title: pageTitle('Buy Bags')}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const [{products}, bagBuddy] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables},
    }),
    storefront.query(BAG_BUDDY_PRODUCTS_QUERY, {
      variables: {
        bag: PRODUCT_PRICING['dumpster-bag'].handle,
        electronics: PRODUCT_PRICING['electronics-addon'].handle,
        mattress: PRODUCT_PRICING['mattress-addon'].handle,
      },
    }),
  ]);
  const featured: Record<ShopProductKind, CollectionItemFragment | null> = {
    'dumpster-bag': bagBuddy.bag ?? null,
    'electronics-addon': bagBuddy.electronics ?? null,
    'mattress-addon': bagBuddy.mattress ?? null,
  };
  return {products, featured};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData(_args: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {products, featured} = useLoaderData<typeof loader>();
  const others = products.nodes.filter(
    (product) => !findProductPricing(product),
  );

  return (
    <div className="bb-page">
      <section className="bb-page__hero">
        <div className="bb-container">
          <h1>Buy Bags</h1>
          <p className="bb-lead">
            Buy the bag, fill the bag, schedule pickup. Pickup is priced by zip
            code: <Link to={BOOK_PICKUP_PATH}>check your area</Link>.
          </p>
        </div>
      </section>
      <section className="bb-section">
        <div className="bb-container">
          <div className="products-grid bb-products-grid">
            {SHOP_PRODUCT_KINDS.map((kind) => {
              const product = featured[kind];
              return product ? (
                <ProductItem key={kind} product={product} loading="eager" />
              ) : (
                <PlannedProductCard key={kind} kind={kind} />
              );
            })}
          </div>
        </div>
      </section>
      {others.length > 0 || products.pageInfo.hasNextPage ? (
        <section className="bb-section bb-section--tint">
          <div className="bb-container">
            <h2 className="bb-section__title">More products</h2>
            <PaginatedResourceSection<CollectionItemFragment>
              connection={products}
              resourcesClassName="products-grid bb-products-grid"
            >
              {({node: product, index}) =>
                findProductPricing(product) ? null : (
                  <ProductItem
                    key={product.id}
                    product={product}
                    loading={index < 8 ? 'eager' : undefined}
                  />
                )
              }
            </PaginatedResourceSection>
          </div>
        </section>
      ) : null}
    </div>
  );
}

/** Card for a Bag Buddy product that is not in Shopify yet. */
function PlannedProductCard({kind}: {kind: ShopProductKind}) {
  const pricing = PRODUCT_PRICING[kind];
  return (
    <Link
      className="product-item bb-product-card"
      prefetch="intent"
      to={`/products/${pricing.handle}`}
    >
      <ProductPlaceholderImage />
      <h3 className="bb-product-card__title">{pricing.title}</h3>
      <div className="bb-product-card__price">
        {pricing.price !== null ? (
          <>
            {formatUsd(pricing.price)} <small>{pricing.unit}</small>
          </>
        ) : null}
      </div>
    </Link>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;

const BAG_BUDDY_PRODUCTS_QUERY = `#graphql
  query BagBuddyProducts(
    $country: CountryCode
    $language: LanguageCode
    $bag: String!
    $electronics: String!
    $mattress: String!
  ) @inContext(country: $country, language: $language) {
    bag: product(handle: $bag) {
      ...CollectionItem
    }
    electronics: product(handle: $electronics) {
      ...CollectionItem
    }
    mattress: product(handle: $mattress) {
      ...CollectionItem
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;
