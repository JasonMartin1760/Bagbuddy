import {Link, useLoaderData, useSearchParams} from 'react-router';
import type {Route} from './+types/book-pickup';
import {ZipChecker} from '~/components/bagbuddy/ZipChecker';
import {CallButton} from '~/components/bagbuddy/ContactButton';
import {ContactSheet} from '~/components/ContactSheet';
import {BulletList} from '~/components/bagbuddy/InfoBlocks';
import {FeesStepPurchase} from '~/components/bagbuddy/FeesStep';
import {loadFeeVariants} from '~/lib/feeVariants';
import {BUY_BAG_PATH, SITE} from '~/config/site';
import {
  HOW_FULL,
  PICKUP_FEES_INTRO,
  PICKUP_FEES_SUBTEXT,
  PLACEMENT,
} from '~/data/content';
import {
  SERVICE_AREAS,
  findServiceZip,
  getServiceArea,
  type ServiceAreaId,
  type ServiceZip,
} from '~/data/serviceAreas';
import {PRODUCT_PRICING, formatUsd, getPickupPricing} from '~/config/pricing';
import {useEffect, useRef, useState} from 'react';

const PICKUP_VARIANTS_QUERY = `#graphql
  query PickupVariants(
    $country: CountryCode
    $language: LanguageCode
    $springs: String!
    $woodland: String!
  ) @inContext(country: $country, language: $language) {
    springs: product(handle: $springs) {
      selectedOrFirstAvailableVariant {
        id
        availableForSale
      }
    }
    woodland: product(handle: $woodland) {
      selectedOrFirstAvailableVariant {
        id
        availableForSale
      }
    }
  }
` as const;

/** Pickup product variants, so a served zip can add its pickup to the cart. */
export async function loader({context}: Route.LoaderArgs) {
  const feeVariantsPromise = loadFeeVariants(context.storefront);
  const springs = PRODUCT_PRICING['pickup-colorado-springs'];
  const woodland = PRODUCT_PRICING['pickup-woodland-park'];
  const variants: Record<string, {id: string; availableForSale: boolean}> = {};
  try {
    const data = await context.storefront.query(PICKUP_VARIANTS_QUERY, {
      variables: {springs: springs.handle, woodland: woodland.handle},
    });
    const s = data.springs?.selectedOrFirstAvailableVariant;
    const w = data.woodland?.selectedOrFirstAvailableVariant;
    if (s) variants[springs.handle] = s;
    if (w) variants[woodland.handle] = w;
  } catch (error) {
    console.error(error);
  }
  return {variants, feeVariants: await feeVariantsPromise};
}

export const meta: Route.MetaFunction = () => {
  return [
    {title: `Book a Pickup | ${SITE.name}`},
    {
      name: 'description',
      content:
        'Check your zip code and book a dumpster bag pickup in Colorado Springs (El Paso County) or Woodland Park (Teller County).',
    },
  ];
};

/**
 * Schedule Bag Pickup page. Pickup is priced by county via zip code. A served
 * zip (El Paso -> Colorado Springs area, Teller -> Woodland Park area) shows
 * that area's starting price and links to the area's pickup product for
 * checkout (`pickup-colorado-springs` / `pickup-woodland-park`). Booking by
 * phone or email is always available.
 */
export default function BookPickup() {
  const {variants, feeVariants} = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const initialZip = (params.get('zip') ?? '').replace(/\D/g, '').slice(0, 5);
  const [match, setMatch] = useState<ServiceZip | null>(
    () => findServiceZip(initialZip) ?? null,
  );
  const areaParam = params.get('area');
  const area: ServiceAreaId | null =
    match?.area ??
    (!initialZip && SERVICE_AREAS.some((a) => a.id === areaParam)
      ? (areaParam as ServiceAreaId)
      : null);
  const served = area ? getServiceArea(area).status === 'served' : false;
  const pickup = area && served ? getPickupPricing(area) : undefined;
  const pickupVariant = pickup ? variants[pickup.handle] : undefined;

  // After a zip is confirmed, bring the "Continue" step into view (mobile).
  const areaRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const pickupHandle = pickup?.handle;
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!pickupHandle) return;
    // Wait a frame so the zip result and Continue step have laid out.
    const id = window.setTimeout(() => {
      areaRef.current?.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }, 60);
    return () => window.clearTimeout(id);
  }, [pickupHandle]);

  const specificDayNote = (
    <div className="bb-day-note">
      <p className="bb-day-note__text">
        Need a specific pickup day? Contact us before you order to make sure
        we&rsquo;re available.
      </p>
      <ContactSheet
        label="Contact"
        buttonClassName="bb-btn bb-day-note__btn"
        title="Ask about a specific pickup day"
        emailSubject="Specific pickup day request"
      />
    </div>
  );

  const zipForEmail = match?.zip ?? initialZip;
  const subject = encodeURIComponent('Pickup request');
  const body = encodeURIComponent(
    `Hi Bag Buddy,\n\nI'd like to book a pickup.\n\nZip code: ${zipForEmail}\nAddress:\nWhere the bag is placed:\nItems that need add-on fees (TVs, mattresses):\nPreferred day:\n\nThanks!`,
  );

  return (
    <div className="bb-page">
      <section className="bb-page__hero">
        <div className="bb-container">
          <h1>Schedule Bag Pickup</h1>
          <p className="bb-lead">
            Filled your bag? Enter your zip code to see your pickup price, add
            any extra items, then check out. Or give us a call.
          </p>
          <p className="bb-page__promise">{SITE.pickupPromise}</p>
        </div>
      </section>

      <section className="bb-section">
        <div className="bb-container bb-book">
          <div className="bb-card">
            <ol className="bb-flow-steps" aria-label="Pickup steps">
              <li aria-current={pickup ? undefined : 'step'}>1. Zip code</li>
              <li aria-current={pickup ? 'step' : undefined}>2. Extra items</li>
              <li>3. Checkout</li>
            </ol>
            <ZipChecker
              heading="Enter your 5-digit zip code"
              helpText="We'll show whether we serve your area and your exact pickup price."
              headingLevel="h2"
              initialZip={initialZip}
              onAreaChange={setMatch}
              variant="flow"
            />
            {pickup ? (
              <div className="bb-book__area" ref={areaRef}>
                {/* Price is already in the zip result; show it here only when
                    the area came from a link without a zip. */}
                {match ? null : (
                  <>
                    <p className="bb-book__area-label">{pickup.label}</p>
                    {pickup.price !== null ? (
                      <p className="bb-book__area-price">
                        {formatUsd(pickup.price)} <small>{pickup.unit}</small>
                      </p>
                    ) : null}
                  </>
                )}
                {pickupVariant?.availableForSale ? (
                  <FeesStepPurchase
                    key={pickup.handle}
                    mainVariant={pickupVariant}
                    feeVariants={feeVariants}
                    mainAttributeKey="Add-on items reviewed"
                    goTo="checkout"
                    startLabel="Continue"
                    submitLabel="Continue to checkout"
                    intro={PICKUP_FEES_INTRO}
                    subtext={PICKUP_FEES_SUBTEXT}
                    stepLabel="Step 2 of 3"
                    beforeStart={specificDayNote}
                    note="Next: tell us about any extra-cost items in your bag, then check out."
                  />
                ) : (
                  <>
                    {specificDayNote}
                    <Link
                      className="bb-btn bb-btn--yellow bb-btn--lg"
                      to={`/products/${pickup.handle}`}
                    >
                      Book &amp; pay for pickup
                    </Link>
                  </>
                )}
              </div>
            ) : null}
            <div className="bb-book__actions">
              <CallButton />
              <a
                className="bb-btn bb-btn--purple"
                href={`mailto:${SITE.email}?subject=${subject}&body=${body}`}
              >
                Request a pickup by email
              </a>
            </div>
            <p className="bb-muted">
              Don&rsquo;t have a bag yet?{' '}
              <Link to={BUY_BAG_PATH}>Buy a dumpster bag</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="bb-specific-day" aria-labelledby="specific-day-title">
        <div className="bb-container bb-book bb-specific-day__inner">
          <div>
            <h2 id="specific-day-title" className="bb-specific-day__title">
              Need a specific day or time?
            </h2>
            <p>Just ask. We&rsquo;ll do our best to work with your schedule.</p>
          </div>
          <ContactSheet
            label="Contact us"
            buttonClassName="bb-btn bb-btn--lg bb-specific-day__btn"
            title="Ask about a specific day or time"
          />
        </div>
      </section>

      <section className="bb-section bb-section--tint">
        <div className="bb-container bb-book">
          <div>
            <h2 className="bb-section__title">Before we arrive</h2>
            <BulletList
              items={[
                HOW_FULL.points[0],
                HOW_FULL.points[2],
                ...PLACEMENT.points.slice(1, 4),
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
