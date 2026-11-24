import {Link, useLoaderData, useSearchParams} from 'react-router';
import type {Route} from './+types/book-pickup';
import {ZipChecker} from '~/components/bagbuddy/ZipChecker';
import {ServiceMap} from '~/components/bagbuddy/ServiceMap';
import {CallButton} from '~/components/bagbuddy/ContactButton';
import {BulletList, FeeList} from '~/components/bagbuddy/InfoBlocks';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {BUY_BAG_PATH, SITE} from '~/config/site';
import {HOW_FULL, PLACEMENT} from '~/data/content';
import {
  SERVICE_AREAS,
  findServiceZip,
  getServiceArea,
  type ServiceAreaId,
  type ServiceZip,
} from '~/data/serviceAreas';
import {PRODUCT_PRICING, formatUsd, getPickupPricing} from '~/config/pricing';
import {useState} from 'react';

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
  return {variants};
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
  const {variants} = useLoaderData<typeof loader>();
  const {open} = useAside();
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
            Filled your bag? Check your zip code to see your pickup price, then
            book online or give us a call.
          </p>
        </div>
      </section>

      <section className="bb-section">
        <div className="bb-container bb-split">
          <div className="bb-card">
            <ZipChecker
              heading="Check cost and if we serve your area"
              helpText="Enter your zip code to check if we serve your area and see your exact pickup price"
              headingLevel="h2"
              initialZip={initialZip}
              onAreaChange={setMatch}
            />
            {pickup ? (
              <div className="bb-book__area">
                <p className="bb-book__area-label">{pickup.label}</p>
                {pickup.price !== null ? (
                  <p className="bb-book__area-price">
                    {formatUsd(pickup.price)} <small>{pickup.unit}</small>
                  </p>
                ) : null}
                {pickupVariant?.availableForSale ? (
                  <AddToCartButton
                    className="bb-btn bb-btn--yellow bb-btn--lg"
                    lines={[{merchandiseId: pickupVariant.id, quantity: 1}]}
                    onClick={() => open('cart')}
                  >
                    Add pickup to cart
                  </AddToCartButton>
                ) : (
                  <Link
                    className="bb-btn bb-btn--yellow bb-btn--lg"
                    to={`/products/${pickup.handle}`}
                  >
                    Book &amp; pay for pickup
                  </Link>
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
          <ServiceMap highlightedArea={served ? area : null} />
        </div>
      </section>

      <section className="bb-section bb-section--tint">
        <div className="bb-container bb-split">
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
          <FeeList />
        </div>
      </section>
    </div>
  );
}
