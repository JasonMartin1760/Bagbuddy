import {Link, useSearchParams} from 'react-router';
import type {Route} from './+types/book-pickup';
import {ZipChecker} from '~/components/bagbuddy/ZipChecker';
import {ServiceMap} from '~/components/bagbuddy/ServiceMap';
import {CallButton} from '~/components/bagbuddy/ContactButton';
import {BulletList, FeeList} from '~/components/bagbuddy/InfoBlocks';
import {BUY_BAG_PATH, SITE} from '~/config/site';
import {HOW_FULL, PLACEMENT} from '~/data/content';
import {findServiceZip, type ServiceAreaId} from '~/data/serviceAreas';
import {useState} from 'react';

export const meta: Route.MetaFunction = () => {
  return [
    {title: `Book a Pickup | ${SITE.name}`},
    {
      name: 'description',
      content:
        'Check your zip code and book a dumpster bag pickup in the Denver metro, Colorado Springs or Woodland Park.',
    },
  ];
};

/**
 * Book Pickup Service. Pickup is priced by zip code and is not a Shopify
 * product. Until an online booking tool is chosen, booking is by phone or
 * email (TODO(Jason)).
 */
export default function BookPickup() {
  const [params] = useSearchParams();
  const initialZip = (params.get('zip') ?? '').replace(/\D/g, '').slice(0, 5);
  const [area, setArea] = useState<ServiceAreaId | null>(
    () => findServiceZip(initialZip)?.area ?? null,
  );

  const subject = encodeURIComponent('Pickup request');
  const body = encodeURIComponent(
    `Hi Bag Buddy,\n\nI'd like to book a pickup.\n\nZip code: ${initialZip}\nAddress:\nWhere the bag is placed:\nItems that need add-on fees (TVs, mattresses):\nPreferred day:\n\nThanks!`,
  );

  return (
    <div className="bb-page">
      <section className="bb-page__hero">
        <div className="bb-container">
          <h1>Book Pickup Service</h1>
          <p className="bb-lead">
            Filled your bag? Check your zip code, then call or email us to
            schedule your pickup.
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
              onAreaChange={setArea}
            />
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
          <ServiceMap highlightedArea={area} />
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
