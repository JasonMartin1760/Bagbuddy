import {Link} from 'react-router';
import type {HeaderQuery} from 'storefrontapi.generated';
import {NAV_ITEMS, SITE, phoneHref} from '~/config/site';
import {SERVICE_AREAS} from '~/data/serviceAreaList';

interface FooterProps {
  header: HeaderQuery;
  publicStoreDomain: string;
}

/**
 * Site footer (an addition to the homepage spec): contact details,
 * service areas and navigation links.
 */
export function Footer(_props: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer bb-footer" id="contact">
      <div className="bb-footer__inner">
        <div className="bb-footer__brand">
          <picture>
            <source
              srcSet="/images/bagbuddy-logo-white.avif"
              type="image/avif"
            />
            <source
              srcSet="/images/bagbuddy-logo-white.webp"
              type="image/webp"
            />
            <img
              src="/images/bagbuddy-logo-white.png"
              alt={SITE.name}
              width={640}
              height={304}
              loading="lazy"
            />
          </picture>
          <p>{SITE.tagline}</p>
        </div>
        <div>
          <h2 className="bb-footer__title">Contact</h2>
          <ul className="bb-footer__list">
            {SITE.phone ? (
              <li>
                <a href={phoneHref(SITE.phone)}>{SITE.phone}</a>
              </li>
            ) : null}
            <li>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="bb-footer__title">Service areas</h2>
          <ul className="bb-footer__list">
            {SERVICE_AREAS.filter((area) => area.status === 'served').map(
              (area) => (
                <li key={area.id}>{area.label}, CO</li>
              ),
            )}
          </ul>
        </div>
        <div>
          <h2 className="bb-footer__title">Links</h2>
          <ul className="bb-footer__list">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link to={item.to} prefetch="intent">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/policies" prefetch="intent">
                Policies
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="bb-footer__legal">
        © {year} {SITE.name}. All rights reserved.
      </p>
    </footer>
  );
}
