import {useState} from 'react';
import {Link} from 'react-router';
import type {Route} from './+types/_index';
import {ServiceMap} from '~/components/bagbuddy/ServiceMap';
import {
  ZipChecker,
  bookPickupHref,
  isServedZip,
} from '~/components/bagbuddy/ZipChecker';
import {
  AllowedLists,
  BulletList,
  FeeList,
} from '~/components/bagbuddy/InfoBlocks';
import {BUY_BAG_PATH, SITE} from '~/config/site';
import {PRODUCT_PRICING, formatUsd} from '~/config/pricing';
import {
  ALLOWED,
  HOW_FULL,
  HOW_IT_WORKS,
  PLACEMENT,
  WHY_DURABAG,
} from '~/data/content';
import type {ServiceZip} from '~/data/serviceAreas';

export const meta: Route.MetaFunction = () => {
  return [
    {title: `${SITE.name} | Dumpster bags and pickup in Colorado`},
    {
      name: 'description',
      content:
        'Buy a dumpster bag, fill it on your own time and book a pickup. Serving Colorado Springs (El Paso County) and Woodland Park (Teller County).',
    },
  ];
};

export default function Homepage() {
  const [match, setMatch] = useState<ServiceZip | null>(null);
  const matchedArea = isServedZip(match) ? match.area : null;
  const bookHref = bookPickupHref(match);
  const bag = PRODUCT_PRICING['dumpster-bag'];

  const hero = SITE.heroImage;

  return (
    <div className="bb-home">
      {/* Hero: zip checker, map and the two main buttons, visible right away. */}
      {/* TODO(Jason): swap the placeholder for the truck photo in app/config/site.ts. */}
      <section
        className={hero.src ? 'bb-hero bb-hero--photo' : 'bb-hero'}
        aria-label="Check your zip code"
      >
        {hero.src ? (
          <picture className="bb-hero__bg">
            <source
              srcSet={hero.src}
              type={hero.src.endsWith('.webp') ? 'image/webp' : undefined}
            />
            <img
              src={hero.fallbackSrc ?? hero.src}
              alt={hero.alt}
              width={1600}
              height={762}
              decoding="async"
            />
          </picture>
        ) : null}
        <div className="bb-hero__inner">
          <div className="bb-hero__checker">
            <ZipChecker
              heading="Check cost and if we serve your area"
              helpText="Enter your zip code to check if we serve your area and see your exact pickup price"
              onAreaChange={setMatch}
            />
          </div>
          <div className="bb-hero__ctas">
            <Link
              className="bb-btn bb-btn--yellow bb-btn--lg"
              to={BUY_BAG_PATH}
            >
              Buy a Dumpster Bag Now
            </Link>
            <Link
              className="bb-btn bb-btn--outline-light bb-btn--lg"
              to={bookHref}
            >
              Book Pickup Service
            </Link>
          </div>
          <div className="bb-hero__map">
            <ServiceMap highlightedArea={matchedArea} />
          </div>
        </div>
      </section>

      <section
        className="bb-section"
        id="services"
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

      <section
        className="bb-section bb-section--tint"
        aria-labelledby="place-title"
      >
        <div className="bb-container">
          <h2 id="place-title" className="bb-section__title">
            {PLACEMENT.title}
          </h2>
          <BulletList items={PLACEMENT.points} />
        </div>
      </section>

      <section className="bb-section" aria-labelledby="full-title">
        <div className="bb-container bb-split">
          <div>
            <h2 id="full-title" className="bb-section__title">
              {HOW_FULL.title}
            </h2>
            <BulletList items={HOW_FULL.points} />
          </div>
          <FeeList />
        </div>
      </section>

      <TrustBar />

      <section
        className="bb-section bb-section--purple"
        aria-labelledby="how-title"
      >
        <div className="bb-container">
          <h2 id="how-title" className="bb-section__title">
            How It Works
          </h2>
          <ol className="bb-steps">
            {HOW_IT_WORKS.map((step, index) => (
              <li key={step.title} className="bb-step">
                <span className="bb-step__num" aria-hidden="true">
                  {index + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                {index === 0 && bag.price !== null ? (
                  <p className="bb-step__price">
                    {formatUsd(bag.price)} <small>{bag.unit}</small>
                  </p>
                ) : null}
                {index === 0 ? (
                  <Link className="bb-step__link" to={BUY_BAG_PATH}>
                    Buy a bag →
                  </Link>
                ) : null}
                {index === 2 ? (
                  <Link className="bb-step__link" to={bookHref}>
                    Book pickup →
                  </Link>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bb-section" id="about" aria-labelledby="why-title">
        <div className="bb-container bb-narrow">
          <h2 id="why-title" className="bb-section__title">
            {WHY_DURABAG.title}
          </h2>
          <p className="bb-lead">{WHY_DURABAG.body}</p>
          <div className="bb-cta-row">
            <Link
              className="bb-btn bb-btn--purple bb-btn--lg"
              to={BUY_BAG_PATH}
            >
              Buy a Dumpster Bag Now
            </Link>
            <Link className="bb-btn bb-btn--outline bb-btn--lg" to={bookHref}>
              Book Pickup Service
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Google rating trust bar. Hidden until SITE.googleRating is set. */
function TrustBar() {
  if (SITE.googleRating === null) return null;
  const stars = '★★★★★';
  const content = (
    <>
      <span className="bb-trust__stars" aria-hidden="true">
        {stars}
      </span>
      <span>
        <strong>{SITE.googleRating.toFixed(1)}/5</strong> stars on Google
        {SITE.googleReviewCount !== null
          ? ` from ${SITE.googleReviewCount} reviews`
          : ''}
      </span>
    </>
  );
  return (
    <section className="bb-trust" aria-label="Google reviews">
      {SITE.googleReviewsUrl ? (
        <a
          href={SITE.googleReviewsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      ) : (
        <p>{content}</p>
      )}
    </section>
  );
}
