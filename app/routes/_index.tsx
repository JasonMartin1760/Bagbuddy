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
import {TESTIMONIALS} from '~/config/testimonials';
import {PRODUCT_PRICING, formatUsd} from '~/config/pricing';
import {
  ABOUT,
  ALLOWED,
  HOW_FULL,
  HOW_IT_WORKS,
  PLACEMENT,
  WHY_BAG_DUMPSTER,
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
              fetchPriority="high"
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
              Schedule Bag Pickup
            </Link>
          </div>
          <div className="bb-hero__map">
            <ServiceMap highlightedArea={matchedArea} />
          </div>
        </div>
      </section>

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
                {index === 2 ? (
                  <TruckPhoto className="bb-step__photo" />
                ) : null}
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
                    Schedule bag pickup →
                  </Link>
                ) : null}
              </li>
            ))}
          </ol>
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

      <section
        className="bb-section bb-section--tint"
        id="placement"
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

      <section
        className="bb-section bb-section--tint"
        id="why-bag-dumpster"
        aria-labelledby="why-title"
      >
        <div className="bb-container bb-narrow">
          <h2 id="why-title" className="bb-section__title">
            {WHY_BAG_DUMPSTER.title}
          </h2>
          <p className="bb-section__intro">{WHY_BAG_DUMPSTER.intro}</p>
          <BulletList items={WHY_BAG_DUMPSTER.points} />
        </div>
      </section>

      {/* Trust bar (PDF) renders once SITE.googleRating is set. */}
      <TrustBar />
      <Testimonials />

      <section className="bb-section" id="about" aria-labelledby="about-title">
        <div className="bb-container bb-about">
          <h2 id="about-title" className="bb-section__title">
            {ABOUT.title}
          </h2>
          <div className="bb-about__story">
            {ABOUT.paragraphs.map((paragraph) => (
              <p key={paragraph} className="bb-lead bb-about__text">
                {paragraph}
              </p>
            ))}
          </div>
          <TruckPhoto className="bb-about__photo" />
          <div className="bb-cta-row bb-about__cta">
            <Link
              className="bb-btn bb-btn--purple bb-btn--lg"
              to={BUY_BAG_PATH}
            >
              Buy a Dumpster Bag Now
            </Link>
            <Link className="bb-btn bb-btn--outline bb-btn--lg" to={bookHref}>
              Schedule Bag Pickup
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

/** Customer quotes, shown in the trust bar's spot on the homepage. */
function Testimonials() {
  if (TESTIMONIALS.items.length === 0) return null;
  return (
    <section
      className="bb-section bb-testimonials"
      aria-labelledby="testimonials-title"
    >
      <div className="bb-container">
        <h2 id="testimonials-title" className="bb-testimonials__title">
          What customers say
        </h2>
        <ul className="bb-testimonials__grid">
          {TESTIMONIALS.items.map((item) => (
            <li key={item.name} className="bb-testimonial">
              <figure>
                <blockquote>
                  <p>&ldquo;{item.quote}&rdquo;</p>
                </blockquote>
                <figcaption>— {item.name}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        {TESTIMONIALS.placeholder ? (
          <p className="bb-muted bb-testimonials__note">
            Sample reviews. Real customer reviews coming soon.
          </p>
        ) : null}
      </div>
    </section>
  );
}

/** Jason's truck photo; below the fold, so it lazy-loads. */
function TruckPhoto({className}: {className: string}) {
  const img = SITE.truckImage;
  return (
    <picture className={className}>
      <source srcSet={img.src} type="image/webp" />
      <img
        src={img.fallbackSrc}
        alt={img.alt}
        width={img.width}
        height={img.height}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
