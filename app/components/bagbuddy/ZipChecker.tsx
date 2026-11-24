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
}: {
  heading: string;
  helpText?: string;
  /** Called after each check with the matched zip (served or coming soon), or null. */
  onAreaChange?: (match: ServiceZip | null) => void;
  headingLevel?: 'h1' | 'h2';
  initialZip?: string;
  /**
   * - `flow`: step 1 of the pickup flow. Checks as soon as 5 digits are typed,
   *   shows the exact area price and leaves the "continue" button to the page.
   * - `compact`: small banner under the homepage map. Same results, with a
   *   "Schedule Bag Pickup" button that carries the zip into the pickup flow.
   */
  variant?: 'default' | 'flow' | 'compact';
}) {
  const inFlow = variant === 'flow';
  const compact = variant === 'compact';
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
    <div className={compact ? 'bb-zip bb-zip--compact' : 'bb-zip'}>
      <Heading className="bb-zip__heading">{heading}</Heading>
      {variant === 'default' ? <PriceNote /> : null}
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
          placeholder="Zip code"
          aria-describedby={helpText ? helpId : undefined}
          aria-invalid={result.status === 'invalid'}
          value={zip}
          onChange={(event) => {
            const value = event.target.value.replace(/\D/g, '').slice(0, 5);
            setZip(value);
            if (inFlow && value.length === 5 && value !== zip) {
              runCheck(value);
              if (findServiceZip(value)) event.target.blur();
            }
          }}
        />
        <button
          type="submit"
          className={
            compact
              ? 'bb-btn bb-btn--outline-light bb-zip__submit'
              : 'bb-btn bb-btn--yellow bb-zip__submit'
          }
        >
          {compact ? 'Check' : 'Verify'}
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
  variant: 'default' | 'flow' | 'compact';
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
          {variant === 'compact' ? (
            <Link
              className="bb-btn bb-btn--outline-light bb-zip__book"
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
