import {useId, type MouseEvent} from 'react';
import {useLoaderData} from 'react-router';
import type {Route} from './+types/dumpster-bag-pickup';
import {
  AllowedLists,
  BulletList,
  FeeList,
} from '~/components/bagbuddy/InfoBlocks';
import {ContactSheet} from '~/components/ContactSheet';
import {SITE, pageTitle} from '~/config/site';
import {
  PRODUCT_PRICING,
  formatUsd,
  type ProductPricing,
} from '~/config/pricing';
import {ALLOWED, HOW_FULL, PICKUP_FEES_INTRO, PLACEMENT} from '~/data/content';
import {FeesStepPurchase} from '~/components/bagbuddy/FeesStep';
import {loadFeeVariants, type FeeVariant} from '~/lib/feeVariants';

const PAGE_PATH = '/dumpster-bag-pickup';
const CHECKOUT_ID = 'checkout';
const PLACEMENT_ID = 'placement';
const PICKUP = PRODUCT_PRICING['pickup-colorado-springs'];

const PICKUP_VARIANT_QUERY = `#graphql
  query DumpsterBagPickupProduct($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      selectedOrFirstAvailableVariant {
        id
        availableForSale
      }
    }
  }
` as const;

export async function loader({context, request}: Route.LoaderArgs) {
  const canonicalUrl = new URL(PAGE_PATH, request.url).href;
  const {storefront} = context;
  // Ad landing page: serve the variant lookups from Oxygen's cache so the
  // page doesn't wait on the Storefront API. Variant IDs don't change;
  // availability refreshes in the background every few minutes.
  const cache = storefront.CacheCustom({
    mode: 'public',
    maxAge: 300,
    staleWhileRevalidate: 86400,
  });
  const [{product}, feeVariants] = await Promise.all([
    storefront.query(PICKUP_VARIANT_QUERY, {
      variables: {handle: PICKUP.handle},
      cache,
    }),
    loadFeeVariants(storefront, cache),
  ]);
  const variant = product?.selectedOrFirstAvailableVariant;

  return {
    canonicalUrl,
    variantId: variant?.id ?? null,
    variantAvailable: variant?.availableForSale ?? false,
    feeVariants,
  };
}

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: pageTitle('Dumpster Bag Pickup Service')},
    {
      name: 'description',
      content:
        'Dumpster bag pickup service. Any brand, any size. Colorado Springs and surrounding metro area. Already have a filled dumpster bag, like the Bagster®? Book your pickup online in minutes. We pick up most bags within three business days.',
    },
    {rel: 'canonical', href: data?.canonicalUrl ?? PAGE_PATH},
  ];
};

/**
 * Google Ads landing page for customers who already have a filled dumpster
 * bag and need pickup in the Colorado Springs area. Ads are geo-fenced, so
 * checkout is shown immediately (no zip checker). Not linked from the main
 * nav.
 */
export default function DumpsterBagPickupLanding() {
  const {variantId, variantAvailable, feeVariants} =
    useLoaderData<typeof loader>();

  return (
    <div className="bb-page bb-landing">
      <section
        className="bb-hero bb-landing-hero"
        aria-label="Dumpster bag pickup"
      >
        <div className="bb-container">
          <h1>Dumpster Bag Pickup Service</h1>
          <p className="bb-landing__brand-line">Any brand, any size</p>
          <p className="bb-landing__area-line">
            Colorado Springs and surrounding metro area
          </p>
          <p className="bb-lead">
            Already have a filled dumpster bag, like the Bagster®? Book your
            pickup online in minutes.
          </p>
          {PICKUP.price !== null ? (
            <p className="bb-landing__prices">
              Pickup is {formatUsd(PICKUP.price)} in the Colorado Springs area.
            </p>
          ) : null}

          <CheckoutCard
            pricing={PICKUP}
            variantId={variantId}
            variantAvailable={variantAvailable}
            feeVariants={feeVariants}
          />
        </div>
      </section>

      <SpecificDayBand />

      <section className="bb-section" aria-labelledby="included-title">
        <div className="bb-container bb-narrow">
          <h2 id="included-title" className="bb-section__title">
            What&rsquo;s included in the pickup price
          </h2>
          <p className="bb-section__intro">
            The pickup price covers crane-truck pickup of one filled dumpster
            bag in the Colorado Springs area. Our truck lifts the bag from your
            driveway or alley and hauls it away. Additional fees apply for large
            electronic devices and mattresses or box springs, listed further
            down this page.
          </p>
        </div>
      </section>

      <section
        className="bb-section bb-section--purple"
        aria-labelledby="how-pickup-title"
      >
        <div className="bb-container">
          <h2 id="how-pickup-title" className="bb-section__title">
            How pickup works
          </h2>
          <ol className="bb-steps">
            <li className="bb-step">
              <span className="bb-step__num" aria-hidden="true">
                1
              </span>
              <h3>Make sure the handles reach together</h3>
              <p>That&rsquo;s how our crane hooks onto the bag safely.</p>
            </li>
            <li className="bb-step">
              <span className="bb-step__num" aria-hidden="true">
                2
              </span>
              <h3>Place where we can reach it</h3>
              <p>
                Leave a clear, safe path for the truck.{' '}
                <a className="bb-step__link" href={`#${PLACEMENT_ID}`}>
                  Where can I place my bag dumpster?
                </a>
              </p>
            </li>
            <li className="bb-step">
              <span className="bb-step__num" aria-hidden="true">
                3
              </span>
              <h3>We pick it up</h3>
              <p>
                Our crane truck lifts the bag from your driveway or alley and
                hauls it away. {SITE.pickupPromise}
              </p>
            </li>
          </ol>
        </div>
      </section>

      <CtaBand
        title="Ready to book your pickup?"
        text={`Checkout takes a minute. ${SITE.pickupPromise}`}
      />

      <section
        className="bb-section"
        id={PLACEMENT_ID}
        aria-labelledby="place-title"
      >
        <div className="bb-container">
          <h2 id="place-title" className="bb-section__title">
            {PLACEMENT.title}
          </h2>
          <p className="bb-section__intro">
            We pick up dumpster bags like the Bagster when they are placed and
            filled according to the rules below.
          </p>
          <BulletList items={PLACEMENT.points} />
        </div>
      </section>

      <section
        className="bb-section bb-section--tint"
        id="how-full"
        aria-labelledby="full-title"
      >
        <div className="bb-container bb-split">
          <div>
            <h2 id="full-title" className="bb-section__title">
              {HOW_FULL.title}
            </h2>
            <BulletList items={HOW_FULL.points} />
          </div>
          <FeeList headingLevel="h2" />
        </div>
      </section>

      <section
        className="bb-section"
        id="allowed"
        aria-labelledby="allowed-title"
      >
        <div className="bb-container">
          <h2 id="allowed-title" className="bb-section__title">
            {ALLOWED.title}
          </h2>
          <p className="bb-section__intro">{ALLOWED.intro}</p>
          <AllowedLists />
        </div>
      </section>

      <CtaBand
        title="Book your pickup"
        text="Checkout on this page to book a Colorado Springs area pickup."
      />

      <SpecificDayBand />

      <p className="bb-landing__disclaimer">
        Bagster® is a registered trademark of Waste Management, Inc. Bag Buddy
        Dumpsters is an independent company and is not affiliated with, endorsed
        by, or sponsored by Waste Management.
      </p>
    </div>
  );
}

function CheckoutCard({
  pricing,
  variantId,
  variantAvailable,
  feeVariants,
}: {
  pricing: ProductPricing;
  variantId: string | null;
  variantAvailable: boolean;
  feeVariants: FeeVariant[];
}) {
  const priceLabel =
    pricing.price !== null ? ` — ${formatUsd(pricing.price)}` : '';

  return (
    <div className="bb-landing__checkout" id={CHECKOUT_ID}>
      <div className="bb-card">
        <h2 className="bb-landing__checkout-title">
          Book your Colorado Springs pickup
        </h2>
        {pricing.price !== null ? (
          <p className="bb-book__area-price">
            {formatUsd(pricing.price)} <small>{pricing.unit}</small>
          </p>
        ) : null}
        <p className="bb-landing__window">{SITE.pickupPromise}</p>

        {variantId ? (
          <FeesStepPurchase
            mainVariant={{id: variantId, availableForSale: variantAvailable}}
            feeVariants={feeVariants}
            mainAttributeKey="Add-on items reviewed"
            goTo="checkout"
            startClassName="bb-btn bb-btn--yellow bb-btn--lg"
            startLabel={`Book pickup${priceLabel}`}
            submitLabel="Continue to checkout"
            intro={PICKUP_FEES_INTRO}
          />
        ) : (
          <p className="bb-landing__fallback" role="status">
            Online checkout isn&rsquo;t available right now.
          </p>
        )}

        <div className="bb-landing__contacts">
          <ContactSheet
            label="Need a specific day?"
            buttonClassName="bb-btn bb-btn--outline bb-btn--lg"
            title="How would you like to reach us?"
          />
        </div>
      </div>
    </div>
  );
}

function SpecificDayBand() {
  const titleId = useId();
  return (
    <section className="bb-specific-day" aria-labelledby={titleId}>
      <div className="bb-container bb-specific-day__inner">
        <div>
          <h2 id={titleId} className="bb-specific-day__title">
            Need a specific day?
          </h2>
          <p>Call, text, or email us and we&rsquo;ll set it up.</p>
        </div>
        <ContactSheet
          label="Contact"
          buttonClassName="bb-btn bb-btn--lg bb-specific-day__btn"
          title="How would you like to reach us?"
        />
      </div>
    </section>
  );
}

function CtaBand({title, text}: {title: string; text: string}) {
  const titleId = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return (
    <section
      className="bb-section bb-section--tint bb-landing-cta"
      aria-labelledby={titleId}
    >
      <div className="bb-container bb-narrow">
        <h2 id={titleId} className="bb-section__title">
          {title}
        </h2>
        <p className="bb-section__intro">{text}</p>
        <div className="bb-cta-row">
          <a
            className="bb-btn bb-btn--yellow bb-btn--lg"
            href={`#${CHECKOUT_ID}`}
            onClick={scrollToCheckout}
          >
            Book your pickup
          </a>
        </div>
      </div>
    </section>
  );
}

function scrollToCheckout(event: MouseEvent<HTMLAnchorElement>) {
  const section = document.getElementById(CHECKOUT_ID);
  if (!section) return;
  event.preventDefault();
  section.scrollIntoView({behavior: 'smooth', block: 'start'});
  section
    .querySelector<HTMLButtonElement>('button')
    ?.focus({preventScroll: true});
}
