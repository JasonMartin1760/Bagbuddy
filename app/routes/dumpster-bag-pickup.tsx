import {type MouseEvent} from 'react';
import {useLoaderData} from 'react-router';
import type {Route} from './+types/dumpster-bag-pickup';
import {
  AllowedLists,
  BulletList,
  FeeList,
} from '~/components/bagbuddy/InfoBlocks';
import {SITE, phoneHref, smsHref} from '~/config/site';
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
  const [{product}, feeVariants] = await Promise.all([
    context.storefront.query(PICKUP_VARIANT_QUERY, {
      variables: {handle: PICKUP.handle},
    }),
    loadFeeVariants(context.storefront),
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
    {title: `Dumpster Bag Pickup in Colorado Springs | ${SITE.name}`},
    {
      name: 'description',
      content:
        'Already have a filled dumpster bag, like the Bagster®? Book a crane-truck pickup in the Colorado Springs area. We pick up most bags within three business days. Book your pickup online in minutes.',
    },
    {rel: 'canonical', href: data?.canonicalUrl ?? PAGE_PATH},
  ];
};

const STEPS = [
  {
    title: 'Get the bag ready',
    text: 'Tie the handles together and place the bag where our crane truck can reach it. See the placement and fill rules below.',
  },
  {
    title: 'Book your pickup',
    text: 'Book your pickup online in minutes with the checkout button on this page.',
  },
  {
    title: 'We pick it up',
    text: 'Our crane truck lifts the bag from your driveway or alley and hauls it away. We pick up most bags within three business days.',
  },
] as const;

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
          <h1>Already have a filled dumpster bag? We&rsquo;ll pick it up.</h1>
          <p className="bb-lead">
            If you already have a filled dumpster bag, like the Bagster®, Bag
            Buddy Dumpsters can pick it up in the Colorado Springs area (El Paso
            County). Book your pickup online in minutes.
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
            {STEPS.map((step, index) => (
              <li key={step.title} className="bb-step">
                <span className="bb-step__num" aria-hidden="true">
                  {index + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand
        title="Ready to book your pickup?"
        text="Checkout takes a minute. We pick up most bags within three business days."
      />

      <section
        className="bb-section"
        id="placement"
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
        <p className="bb-landing__window">We pick up most bags within three business days.</p>

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
            note="Next: add any extra-cost items in your bag, then check out."
          />
        ) : (
          <p className="bb-landing__fallback" role="status">
            Online checkout isn&rsquo;t available right now. <SpecificDayNote />
          </p>
        )}

        {variantId ? (
          <p className="bb-landing__exception">
            <SpecificDayNote />
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SpecificDayNote() {
  if (!SITE.phone) {
    return <>Need a specific day? Call or text and we&rsquo;ll set it up.</>;
  }
  return (
    <>
      Need a specific day? <a href={phoneHref(SITE.phone)}>Call</a> or{' '}
      <a href={smsHref(SITE.phone)}>text</a> and we&rsquo;ll set it up.
    </>
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
