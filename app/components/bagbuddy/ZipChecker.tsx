import {useId, useState, type FormEvent} from 'react';
import {Link} from 'react-router';
import {
  findServiceZip,
  getServiceArea,
  isValidZip,
  type ServiceAreaId,
  type ServiceZip,
} from '~/data/serviceAreas';
import {PICKUP_STARTING_PRICE, formatUsd} from '~/config/pricing';

type Result =
  | {status: 'idle'}
  | {status: 'invalid'}
  | {status: 'unserved'; zip: string}
  | {status: 'served'; match: ServiceZip};

/**
 * Client-side zip code checker: validates 5 digits, looks the zip up in the
 * service-area list and shows the starting pickup price for that area.
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
  onAreaChange?: (area: ServiceAreaId | null) => void;
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
    onAreaChange?.(next.status === 'served' ? next.match.area : null);
  }

  return (
    <div className="bb-zip">
      <Heading className="bb-zip__heading">{heading}</Heading>
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

function checkZip(raw: string): Result {
  const value = raw.trim();
  if (!value) return {status: 'idle'};
  if (!isValidZip(value)) return {status: 'invalid'};
  const match = findServiceZip(value);
  return match ? {status: 'served', match} : {status: 'unserved', zip: value};
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
          We&rsquo;re sorry, we do not serve this area yet.
        </p>
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
            <Link to={`/book-pickup?zip=${match.zip}`}>Book a pickup</Link>
          </p>
        </div>
      );
    }
  }
}
