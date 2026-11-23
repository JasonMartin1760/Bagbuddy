import {useId} from 'react';
import {ADDITIONAL_FEES, formatUsd} from '~/config/pricing';
import {ALLOWED} from '~/data/content';

/** Two-column Allowed / Not Allowed lists from the homepage spec. */
export function AllowedLists({
  headingLevel = 'h3',
}: {
  headingLevel?: 'h3' | 'h4';
}) {
  const Heading = headingLevel;
  return (
    <div className="bb-allowed">
      <div className="bb-allowed__col bb-allowed__col--yes">
        <Heading>Allowed</Heading>
        <ul>
          {ALLOWED.allowed.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="bb-allowed__col bb-allowed__col--no">
        <Heading>Not Allowed</Heading>
        <ul>
          {ALLOWED.notAllowed.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function BulletList({items}: {items: readonly string[]}) {
  return (
    <ul className="bb-bullets">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** "Additional Fees" box ($35 electronics, $80 mattress / box spring). */
export function FeeList({headingLevel = 'h3'}: {headingLevel?: 'h2' | 'h3'}) {
  const Heading = headingLevel;
  const titleId = useId();
  return (
    <section className="bb-fees" aria-labelledby={titleId}>
      <Heading id={titleId}>Additional Fees</Heading>
      <ul>
        {ADDITIONAL_FEES.map((fee) => (
          <li key={fee.kind}>
            <span>{fee.label}</span>
            <strong>
              {fee.price !== null ? formatUsd(fee.price) : '—'}{' '}
              <small>{fee.unit}</small>
            </strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
