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
  formatUsd,
} from '~/config/pricing';
import {CallButton, TextButton} from '~/components/bagbuddy/ContactButton';

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
  variant = 'default',
  className = '',
}: {
  heading: string;
  helpText?: string;
  /** Called after each check with the matched zip (served or coming soon), or null. */
  onAreaChange?: (match: ServiceZip | null) => void;
  headingLevel?: 'h1' | 'h2' | 'h3';
  initialZip?: string;
  /**
   * - `flow`: step 1 of the pickup flow. Checks as soon as 5 digits are typed,
   *   shows the exact area price and leaves the "continue" button to the page.
   * - `banner`: under the homepage map. Same results, with a "Schedule Bag
   *   Pickup" button that carries the zip into the pickup flow.
   */
  variant?: 'default' | 'flow' | 'banner';
  /** Extra class, e.g. `bb-zip--small` inside the bag purchase step. */
  className?: string;
}) {
  const inFlow = variant === 'flow';
  const inputId = useId();
  const helpId = useId();
  const [zip, setZip] = useState(initialZip);
  const [result, setResult] = useState<Result>(() => checkZip(initialZip));
  const Heading = headingLevel;

  function runCheck(value: string) {
    const next = checkZip(value);
    setResult(next.status === 'idle' ? {status: 'invalid'} : next);
    onAreaChange?.(
      next.status === 'served' || next.status === 'coming-soon'
        ? next.match
        : null,
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runCheck(zip);
  }

  return (
    <div className={`bb-zip bb-zip--${variant} ${className}`.trim()}>
      <Heading className="bb-zip__heading">{heading}</Heading>
      {variant === 'default' ? <PriceNote /> : null}
      <form className="bb-zip__form" onSubmit={handleSubmit} noValidate>
        <label htmlFor={inputId} className="visually-hidden">
          Enter your 5-digit zip code
        </label>
        <input
          id={inputId}
          className="bb-zip__input"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          pattern="[0-9]{5}"
          maxLength={5}
          placeholder="5-digit zip code"
          aria-describedby={helpText ? helpId : undefined}
          aria-invalid={result.status === 'invalid'}
          value={zip}
          onChange={(event) => {
            const value = cleanZip(event.target.value);
            setZip(value);
            // Instant result once 5 digits are in.
            if (value.length === 5 && value !== zip) {
              runCheck(value);
              if (inFlow && findServiceZip(value)) event.target.blur();
            }
          }}
        />
        <button
          type="submit"
          className="bb-btn bb-zip__submit"
        >
          Verify
        </button>
      </form>
      {helpText ? (
        <p id={helpId} className="bb-zip__help">
          {helpText}
        </p>
      ) : null}
      <div className="bb-zip__result" role="status" aria-live="polite">
        <ZipResult result={result} variant={variant} />
      </div>
    </div>
  );
}

/**
 * Starting pickup price under the heading: "starting at" the lowest area
 * price (Colorado Springs $130; Woodland Park is $150).
 */
function PriceNote() {
  if (LOWEST_PICKUP_PRICE === null) return null;
  return (
    <p className="bb-zip__prices">
      Pickup starting at {formatUsd(LOWEST_PICKUP_PRICE)}
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

/**
 * Keeps only a 5-digit zip: drops anything after a dash (ZIP+4 autofill,
 * e.g. "80903-1234") and any non-digits.
 */
function cleanZip(raw: string): string {
  return raw.split('-')[0].replace(/\D/g, '').slice(0, 5);
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

function ZipResult({
  result,
  variant,
}: {
  result: Result;
  variant: 'default' | 'flow' | 'banner';
}) {
  const showContact = variant !== 'default';
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
        <div className="bb-zip__msg bb-zip__msg--error">
          <p>We&rsquo;re sorry, we do not serve this area.</p>
          {showContact ? (
            <>
              <p className="bb-zip__unserved-help">
                Not sure? Call or text us and we&rsquo;ll check for you.
              </p>
              <div className="bb-zip__soon-cta">
                <CallButton />
                <TextButton />
              </div>
            </>
          ) : null}
        </div>
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
            {showContact ? <TextButton /> : null}
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
            {price === null
              ? 'Call or book for your pickup price'
              : variant !== 'default'
                ? `Your pickup price: ${formatUsd(price)}`
                : `Pickup starting at ${formatUsd(price)} in your area`}
          </p>
          <p className="bb-zip__where">
            {area.label} area · {match.zip}
            {variant === 'default' ? (
              <>
                {' · '}
                <Link to={bookPickupHref(match)}>Schedule bag pickup</Link>
              </>
            ) : null}
          </p>
          {variant === 'banner' ? (
            <Link
              className="bb-btn bb-btn--purple bb-zip__book"
              to={bookPickupHref(match)}
            >
              Schedule Bag Pickup
            </Link>
          ) : null}
        </div>
      );
    }
  }
}
