import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import type {ProductFragment} from 'storefrontapi.generated';
import {ProductPlaceholderImage} from '~/components/ProductItem';
import {CallButton} from '~/components/bagbuddy/ContactButton';
import {
  AllowedLists,
  BulletList,
  FeeList,
} from '~/components/bagbuddy/InfoBlocks';
import {
  PRODUCT_KINDS,
  PRODUCT_PRICING,
  findProductPricing,
  formatUsd,
  isPickupKind,
  type ProductKind,
  type ProductPricing,
} from '~/config/pricing';
import {BOOK_PICKUP_PATH, BUY_BAG_PATH, SITE} from '~/config/site';
import {
  ALLOWED,
  getContentByKind,
  getProductContent,
  type ContentBlock,
} from '~/data/content';

export const meta: Route.MetaFunction = ({data}) => {
  const title = data?.product?.title ?? data?.planned?.title ?? 'Product';
  const handle = data?.product?.handle ?? data?.planned?.handle ?? '';
  return [
    {title: `${title} | ${SITE.name}`},
    {
      rel: 'canonical',
      href: `/products/${handle}`,
    },
  ];
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
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    // Bag Buddy products that are planned but not yet created in Shopify
    // admin still get an informational page instead of a 404.
    const planned = PRODUCT_KINDS.map((kind) => PRODUCT_PRICING[kind]).find(
      (entry) => entry.handle === handle,
    );
    if (planned) {
      return {product: null, planned};
    }
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
    planned: null,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData(_args: Route.LoaderArgs) {
  return {};
}

export default function Product() {
  const data = useLoaderData<typeof loader>();
  if (!data.product) {
    return <PlannedProduct pricing={data.planned} />;
  }
  return <ShopifyProduct product={data.product} />;
}

function ShopifyProduct({product}: {product: ProductFragment}) {
  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;
  const pricing = findProductPricing(product);
  const content = getProductContent(product);

  return (
    <div className="bb-pdp">
      <div className="bb-container bb-pdp__top">
        <div className="bb-pdp__media">
          {selectedVariant?.image ? (
            <ProductImage image={selectedVariant.image} />
          ) : (
            <ProductPlaceholderImage />
          )}
        </div>
        <div className="bb-pdp__main">
          <h1>{title}</h1>
          <div className="bb-pdp__price">
            {pricing && pricing.price !== null ? (
              <p>
                {formatUsd(pricing.price)} <small>{pricing.unit}</small>
              </p>
            ) : (
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
            )}
          </div>
          <p className="bb-pdp__summary">{content.summary}</p>
          <ul className="bb-pdp__highlights">
            {content.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />
          <ProductCrossLinks kind={pricing?.kind} />
          {descriptionHtml ? (
            <div
              className="bb-pdp__description"
              dangerouslySetInnerHTML={{__html: descriptionHtml}}
            />
          ) : null}
        </div>
      </div>
      <ProductContentBlocks blocks={content.blocks} />
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

/** Page for a Bag Buddy product that has not been created in Shopify yet. */
function PlannedProduct({pricing}: {pricing: ProductPricing}) {
  const content = getContentByKind(pricing.kind);
  return (
    <div className="bb-pdp">
      <div className="bb-container bb-pdp__top">
        <div className="bb-pdp__media">
          <ProductPlaceholderImage />
        </div>
        <div className="bb-pdp__main">
          <h1>{pricing.title}</h1>
          {pricing.price !== null ? (
            <div className="bb-pdp__price">
              <p>
                {formatUsd(pricing.price)} <small>{pricing.unit}</small>
              </p>
            </div>
          ) : (
            <p className="bb-pdp__summary">
              <strong>Call or book for your pickup price.</strong>
            </p>
          )}
          <p className="bb-pdp__summary">{content.summary}</p>
          <ul className="bb-pdp__highlights">
            {content.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="bb-notice" role="status">
            <p>
              <strong>
                Online {isPickupKind(pricing.kind) ? 'booking' : 'ordering'} is
                coming soon.
              </strong>{' '}
              Call or email us to{' '}
              {isPickupKind(pricing.kind) ? 'book your pickup' : 'order'} today.
            </p>
            <div className="bb-cta-row">
              <CallButton />
              <a
                className="bb-btn bb-btn--purple"
                href={`mailto:${SITE.email}?subject=${encodeURIComponent(`Order: ${pricing.title}`)}`}
              >
                Order by email
              </a>
            </div>
          </div>
          <ProductCrossLinks kind={pricing.kind} />
        </div>
      </div>
      <ProductContentBlocks blocks={content.blocks} />
    </div>
  );
}

function ProductCrossLinks({kind}: {kind?: ProductKind}) {
  if (kind && isPickupKind(kind)) {
    return (
      <p className="bb-muted bb-pdp__cross">
        Pickup is priced by county.{' '}
        <Link to={BOOK_PICKUP_PATH}>Check your zip code</Link> to make sure this
        is your area. <Link to={BUY_BAG_PATH}>Need a bag?</Link>
      </p>
    );
  }
  if (kind === 'dumpster-bag' || !kind) {
    return (
      <p className="bb-muted bb-pdp__cross">
        Pickup is booked separately and priced by zip code.{' '}
        <Link to={BOOK_PICKUP_PATH}>Check your zip and book a pickup</Link>.
      </p>
    );
  }
  return (
    <p className="bb-muted bb-pdp__cross">
      Add one for each item in your bag.{' '}
      <Link to={BUY_BAG_PATH}>Need a bag?</Link>
    </p>
  );
}

function ProductContentBlocks({blocks}: {blocks: readonly ContentBlock[]}) {
  return (
    <div className="bb-pdp__blocks">
      {blocks.map((block, index) => {
        const tint = index % 2 === 0 ? ' bb-section--tint' : '';
        if (block.type === 'allowed') {
          return (
            <section key="allowed" className={`bb-section${tint}`}>
              <div className="bb-container">
                <h2 className="bb-section__title">{ALLOWED.title}</h2>
                <p className="bb-section__intro">{ALLOWED.intro}</p>
                <AllowedLists />
              </div>
            </section>
          );
        }
        return (
          <section key={block.title} className={`bb-section${tint}`}>
            <div className="bb-container bb-split">
              <div>
                <h2 className="bb-section__title">{block.title}</h2>
                {block.type === 'list' ? (
                  <BulletList items={block.items} />
                ) : (
                  <p>{block.body}</p>
                )}
              </div>
              {index === 0 ? <FeeList /> : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    tags
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
