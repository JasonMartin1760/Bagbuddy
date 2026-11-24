import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import {Link} from 'react-router';
import type {ServiceZip} from '~/data/serviceAreas';
import {
  getServiceArea,
  isValidZip,
  type ServiceAreaId,
} from '~/data/serviceAreaList';
import {getZipLookup, loadZipLookup, type ZipLookup} from '~/lib/zipLookup';
import {
  LOWEST_PICKUP_PRICE,
  PICKUP_STARTING_PRICE,
  formatUsd,
} from '~/config/pricing';
import {CallButton, TextButton} from '~/components/bagbuddy/ContactButton';
import {SITE, phoneHref} from '~/config/site';

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
  subheading,
  compactServed = false,
  placeholder = '5-digit zip code',
}: {
  heading: string;
  /** Optional short line under the heading (homepage pickup flow). */
  subheading?: ReactNode;
  /** Served result as one line: "✅ We serve your area · $130 per pickup". Off by default. */
  compactServed?: boolean;
  /** Input placeholder. */
  placeholder?: string;
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
   * - `inline`: one-line optional check in the bag purchase sheet. The
   *   heading is the input's visible label and the result is one short line.
   */
  variant?: 'default' | 'flow' | 'banner' | 'inline';
  /** Extra class, e.g. `bb-zip--small` inside the bag purchase step. */
  className?: string;
}) {
  const inFlow = variant === 'flow';
  const inline = variant === 'inline';
  const inputId = useId();
  const helpId = useId();
  const [zip, setZip] = useState(initialZip);
  const [result, setResult] = useState<Result>(() =>
    checkZip(initialZip, getZipLookup()),
  );
  const Heading = headingLevel;
  // Latest value checked, so a slow first load of the zip list can't
  // overwrite a newer check.
  const latestCheck = useRef(initialZip);

  // An initial zip whose list wasn't loaded yet (pages that don't provide
  // it): check it as soon as the list arrives.
  useEffect(() => {
    if (!initialZip || getZipLookup() || !isValidZip(initialZip)) return;
    let active = true;
    void loadZipLookup().then((lookup) => {
      if (active && latestCheck.current === initialZip) {
        setResult(checkZip(initialZip, lookup));
      }
    });
    return () => {
      active = false;
    };
  }, [initialZip]);

  function runCheck(value: string, onChecked?: (next: Result) => void) {
    latestCheck.current = value;
    const apply = (next: Result) => {
      setResult(next.status === 'idle' ? {status: 'invalid'} : next);
      onAreaChange?.(
        next.status === 'served' || next.status === 'coming-soon'
          ? next.match
          : null,
      );
      onChecked?.(next);
    };
    const lookup = getZipLookup();
    if (lookup || !isValidZip(value)) {
      apply(checkZip(value, lookup));
      return;
    }
    void loadZipLookup().then((loaded) => {
      if (latestCheck.current === value) apply(checkZip(value, loaded));
    });
  }

  function preloadZipList() {
    void loadZipLookup();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runCheck(zip);
  }

  return (
    <div className={`bb-zip bb-zip--${variant} ${className}`.trim()}>
      {inline ? null : <Heading className="bb-zip__heading">{heading}</Heading>}
      {subheading ? <p className="bb-zip__subheading">{subheading}</p> : null}
      {variant === 'default' ? <PriceNote /> : null}
      {inline ? (
        <label htmlFor={inputId} className="bb-zip__label">
          {heading}
        </label>
      ) : null}
      <form
        className="bb-zip__form"
        onSubmit={handleSubmit}
        onFocus={preloadZipList}
        onPointerEnter={preloadZipList}
        onTouchStart={preloadZipList}
        noValidate
      >
        {inline ? null : (
          <label htmlFor={inputId} className="visually-hidden">
            Enter your 5-digit zip code
          </label>
        )}
        <input
          id={inputId}
          className="bb-zip__input"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          pattern="[0-9]*"
          placeholder={placeholder}
          aria-describedby={helpText ? helpId : undefined}
          aria-invalid={result.status === 'invalid'}
          value={zip}
          onChange={(event) => {
            const value = cleanZip(event.target.value);
            setZip(value);
            // Instant result once 5 digits are in.
            if (value.length === 5 && value !== zip) {
              const input = event.target;
              runCheck(value, (next) => {
                if (
                  inFlow &&
                  (next.status === 'served' || next.status === 'coming-soon')
                ) {
                  input.blur();
                }
              });
            }
          }}
        />
        <button type="submit" className="bb-btn bb-zip__submit">
          Verify
        </button>
      </form>
      {helpText ? (
        <p id={helpId} className="bb-zip__help">
          {helpText}
        </p>
      ) : null}
      <div className="bb-zip__result" role="status" aria-live="polite">
        {inline ? (
          <InlineResult result={result} />
        ) : (
          <ZipResult
            result={result}
            variant={variant}
            compactServed={compactServed}
          />
        )}
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
 * Keeps only the 5-digit zip. Handles ZIP+4 from autofill or paste with or
 * without the dash ("80922-2150", "80922 2150", "809222150") by taking the
 * first 5 digits. The input has no maxLength on purpose: iOS autofill and
 * paste would otherwise be cut off or blocked before reaching onChange.
 */
export function cleanZip(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 5);
}

/** One short result line for the inline (bag sheet) check. */
function InlineResult({result}: {result: Result}) {
  const phone = SITE.phone;
  const contact = phone ? (
    <>
      {' '}
      Call or text <a href={phoneHref(phone)}>{phone}</a>.
    </>
  ) : null;
  switch (result.status) {
    case 'idle':
      return null;
    case 'invalid':
      return (
        <p className="bb-zip__line bb-zip__line--bad">
          Please enter a 5-digit zip code.
        </p>
      );
    case 'unserved':
      return (
        <p className="bb-zip__line bb-zip__line--bad">
          Sorry, we don&rsquo;t serve this area yet.{contact}
        </p>
      );
    case 'coming-soon':
      return <p className="bb-zip__line">Coming soon to your area.{contact}</p>;
    case 'served': {
      const price = PICKUP_STARTING_PRICE[result.match.area];
      const area = getServiceArea(result.match.area);
      return (
        <p className="bb-zip__line bb-zip__line--ok">
          ✓ We serve the {area.label} area
          {price !== null ? ` · pickup ${formatUsd(price)}` : ''}
        </p>
      );
    }
  }
}

function checkZip(raw: string, lookup: ZipLookup | null): Result {
  const value = raw.trim();
  if (!value) return {status: 'idle'};
  if (!isValidZip(value)) return {status: 'invalid'};
  // Only reached before the zip list loads for a pre-filled zip (see the
  // effect in ZipChecker); the result follows once it arrives.
  if (!lookup) return {status: 'idle'};
  const match = lookup(value);
  if (!match) return {status: 'unserved', zip: value};
  return isServedZip(match)
    ? {status: 'served', match}
    : {status: 'coming-soon', match};
}

function ZipResult({
  result,
  variant,
  compactServed = false,
}: {
  result: Result;
  variant: 'default' | 'flow' | 'banner' | 'inline';
  compactServed?: boolean;
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
      if (compactServed) {
        return (
          <p className="bb-zip__msg bb-zip__msg--success bb-zip__served-line">
            ✅ We serve your area
            {price !== null ? ` · ${formatUsd(price)} per pickup` : ''}
          </p>
        );
      }
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
