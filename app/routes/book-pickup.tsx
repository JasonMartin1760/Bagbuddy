import {Link, useLoaderData, useSearchParams} from 'react-router';
import type {Route} from './+types/book-pickup';
import {ZipChecker} from '~/components/bagbuddy/ZipChecker';
import {ContactSheet} from '~/components/ContactSheet';
import {BulletList} from '~/components/bagbuddy/InfoBlocks';
import {PickupSteps} from '~/components/bagbuddy/PickupSteps';
import {loadFeeVariants} from '~/lib/feeVariants';
import {productDataCache} from '~/lib/cache';
import {BUY_BAG_PATH, SITE, phoneHref} from '~/config/site';
import {HOW_FULL, PLACEMENT} from '~/data/content';
import {
  SERVICE_AREAS,
  findServiceZip,
  getServiceArea,
  type ServiceAreaId,
  type ServiceZip,
} from '~/data/serviceAreas';
import {PRODUCT_PRICING, formatUsd, getPickupPricing} from '~/config/pricing';
import {provideZipLookup} from '~/lib/zipLookup';
import {useEffect, useRef, useState} from 'react';

// This page checks a ?zip= link during its first render, so it ships the zip
// list with the page and hands it to the zip checker.
provideZipLookup(findServiceZip);

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
  const cache = productDataCache(context.storefront);
  const feeVariantsPromise = loadFeeVariants(context.storefront, cache);
  const springs = PRODUCT_PRICING['pickup-colorado-springs'];
  const woodland = PRODUCT_PRICING['pickup-woodland-park'];
  const variants: Record<string, {id: string; availableForSale: boolean}> = {};
  try {
    const data = await context.storefront.query(PICKUP_VARIANTS_QUERY, {
      variables: {springs: springs.handle, woodland: woodland.handle},
      cache,
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

  // Shown only after a served zip result, directly below Continue.
  const specificDayButton = (
    <ContactSheet
      label="Need a specific pickup day? Contact us first"
      buttonClassName="bb-btn bb-btn--outline bb-btn--lg bb-buy__start bb-day-btn"
      title="Ask about a specific pickup day"
      emailSubject="Specific pickup day request"
    />
  );

  return (
    <div className="bb-page bb-pickup">
      <section className="bb-section bb-pickup__section">
        <div className="bb-container bb-book">
          <div className="bb-card">
            <p className="bb-fees-step__eyebrow">Step 1 of 3</p>
            <ZipChecker
              heading="Where’s your bag?"
              subheading={SITE.pickupPromise}
              headingLevel="h1"
              initialZip={initialZip}
              onAreaChange={setMatch}
              variant="flow"
              compactServed
              placeholder="5-digit zip"
            />
            {pickup ? (
              <div className="bb-book__area" ref={areaRef}>
                {/* The zip result already shows the price; show it here only
                    when the area came from a link without a zip. */}
                {match || !area || pickup.price === null ? null : (
                  <p className="bb-zip__msg bb-zip__msg--success bb-zip__served-line">
                    ✅ We serve the {getServiceArea(area).label} area
                    {` · ${formatUsd(pickup.price)} per pickup`}
                  </p>
                )}
                {pickupVariant?.availableForSale ? (
                  <PickupSteps
                    key={pickup.handle}
                    mainVariant={pickupVariant}
                    feeVariants={feeVariants}
                    pickupPrice={pickup.price}
                    afterStart={specificDayButton}
                  />
                ) : (
                  <>
                    <Link
                      className="bb-btn bb-btn--yellow bb-btn--lg bb-buy__start"
                      to={`/products/${pickup.handle}`}
                    >
                      Book &amp; pay for pickup
                    </Link>
                    {specificDayButton}
                  </>
                )}
              </div>
            ) : null}
          </div>
          <p className="bb-pickup__questions">
            {SITE.phone ? (
              <>
                Questions? Call <a href={phoneHref(SITE.phone)}>{SITE.phone}</a>
                {' · '}
              </>
            ) : null}
            Need a bag? <Link to={BUY_BAG_PATH}>Buy one</Link>
          </p>
          <details className="bb-pickup__before">
            <summary>Before we arrive</summary>
            <BulletList
              items={[
                HOW_FULL.points[0],
                HOW_FULL.points[2],
                ...PLACEMENT.points.slice(1, 4),
              ]}
            />
          </details>
        </div>
      </section>
    </div>
  );
}
