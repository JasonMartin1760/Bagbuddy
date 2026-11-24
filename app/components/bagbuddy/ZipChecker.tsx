import {useId, useState, type FormEvent} from 'react';
import {Link} from 'react-router';
import {
  findServiceZip,
  getServiceArea,
  isValidZip,
  type ServiceAreaId,
  type ServiceZip,
} from '~/data/serviceAreas';
import {
  LOWEST_PICKUP_PRICE,
  PICKUP_STARTING_PRICE,
  PRODUCT_PRICING,
  formatUsd,
} from '~/config/pricing';
import {CallButton} from '~/components/bagbuddy/ContactButton';

type Result =
  | {status: 'idle'}
  | {status: 'invalid'}
  | {status: 'unserved'; zip: string}
  | {status: 'coming-soon'; match: ServiceZip}
  | {status: 'served'; match: ServiceZip};

/**
 * Client-side zip code checker: validates 5 digits, looks the zip up in the
 * service-area list and shows the starting pickup price for that area.
 * - Served area (El Paso / Teller county zips): green message + price.
 * - Coming-soon area (Denver metro): "coming soon" message + call option.
 * - Any other zip: "We're sorry, we do not serve this area."
 */
export function ZipChecker({
  heading,
  helpText,
  onAreaChange,
  headingLevel = 'h1',
  initialZip = '',
}: {
  heading: string;
  helpText?: string;
  /** Called after each check with the matched zip (served or coming soon), or null. */
  onAreaChange?: (match: ServiceZip | null) => void;
  headingLevel?: 'h1' | 'h2';
  initialZip?: string;
}) {
  const inputId = useId();
  const helpId = useId();
  const [zip, setZip] = useState(initialZip);
  const [result, setResult] = useState<Result>(() => checkZip(initialZip));
  const Heading = headingLevel;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = checkZip(zip);
    setResult(next.status === 'idle' ? {status: 'invalid'} : next);
    onAreaChange?.(
      next.status === 'served' || next.status === 'coming-soon'
        ? next.match
        : null,
    );
  }

  return (
    <div className="bb-zip">
      <Heading className="bb-zip__heading">{heading}</Heading>
      <PriceNote />
      <form className="bb-zip__form" onSubmit={handleSubmit} noValidate>
        <label htmlFor={inputId} className="visually-hidden">
          Zip code
        </label>
        <input
          id={inputId}
          className="bb-zip__input"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          pattern="[0-9]{5}"
          maxLength={5}
          placeholder="Enter zip code"
          aria-describedby={helpText ? helpId : undefined}
          aria-invalid={result.status === 'invalid'}
          value={zip}
          onChange={(event) =>
            setZip(event.target.value.replace(/\D/g, '').slice(0, 5))
          }
        />
        <button type="submit" className="bb-btn bb-btn--yellow bb-zip__submit">
          Verify
        </button>
      </form>
      {helpText ? (
        <p id={helpId} className="bb-zip__help">
          {helpText}
        </p>
      ) : null}
      <div className="bb-zip__result" role="status" aria-live="polite">
        <ZipResult result={result} />
      </div>
    </div>
  );
}

/**
 * Starting prices under the heading. Pickup is "starting at" the lowest
 * area price (Colorado Springs $130; Woodland Park is $150).
 */
function PriceNote() {
  const bag = PRODUCT_PRICING['dumpster-bag'].price;
  if (LOWEST_PICKUP_PRICE === null && bag === null) return null;
  return (
    <p className="bb-zip__prices">
      {LOWEST_PICKUP_PRICE !== null ? (
        <span className="bb-zip__price-pill">
          Pickup starting at <strong>{formatUsd(LOWEST_PICKUP_PRICE)}</strong>
        </span>
      ) : null}
      {bag !== null ? (
        <span className="bb-zip__price-pill">
          Dumpster bags <strong>{formatUsd(bag)}</strong>
        </span>
      ) : null}
    </p>
  );
}

/** True when the zip's area is open for booking. */
export function isServedZip(match: ServiceZip | null): match is ServiceZip {
  return !!match && getServiceArea(match.area).status === 'served';
}

/**
 * Book Pickup link that carries a served zip and its area, so the booking
 * page shows that area's price and pickup checkout.
 */
export function bookPickupHref(match: ServiceZip | null): string {
  return isServedZip(match)
    ? `/book-pickup?zip=${match.zip}&area=${match.area}`
    : '/book-pickup';
}

function checkZip(raw: string): Result {
  const value = raw.trim();
  if (!value) return {status: 'idle'};
  if (!isValidZip(value)) return {status: 'invalid'};
  const match = findServiceZip(value);
  if (!match) return {status: 'unserved', zip: value};
  return isServedZip(match)
    ? {status: 'served', match}
    : {status: 'coming-soon', match};
}

function ZipResult({result}: {result: Result}) {
  switch (result.status) {
    case 'idle':
      return null;
    case 'invalid':
      return (
        <p className="bb-zip__msg bb-zip__msg--error">
          Please enter a valid 5-digit zip code.
        </p>
      );
    case 'unserved':
      return (
        <p className="bb-zip__msg bb-zip__msg--error">
          We&rsquo;re sorry, we do not serve this area.
        </p>
      );
    case 'coming-soon':
      return (
        <div className="bb-zip__msg bb-zip__msg--soon">
          <p className="bb-zip__soon-title">Coming soon to your area</p>
          <p>
            We&rsquo;re not offering service in your area yet, but we plan to
            offer service in this area soon.
          </p>
          <div className="bb-zip__soon-cta">
            <CallButton />
          </div>
        </div>
      );
    case 'served': {
      const {match} = result;
      const area = getServiceArea(match.area);
      const price = PICKUP_STARTING_PRICE[match.area];
      return (
        <div className="bb-zip__msg bb-zip__msg--success">
          <p className="bb-zip__served">✅ We serve your area!</p>
          <p className="bb-zip__price">
            {price !== null
              ? `Pickup starting at ${formatUsd(price)} in your area`
              : 'Call or book for your pickup price'}
          </p>
          <p className="bb-zip__where">
            {area.label} area · {match.zip} ·{' '}
            <Link to={bookPickupHref(match)}>Schedule bag pickup</Link>
          </p>
        </div>
      );
    }
  }
}
