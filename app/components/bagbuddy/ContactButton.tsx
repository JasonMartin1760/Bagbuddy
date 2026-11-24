import {SITE, phoneHref} from '~/config/site';

/**
 * Prominent click-to-call button. While no phone number is configured
 * (TODO(Jason) in app/config/site.ts) it falls back to an email link.
 */
export function CallButton({className = ''}: {className?: string}) {
  if (SITE.phone) {
    return (
      <a
        className={`bb-btn bb-btn--call ${className}`}
        href={phoneHref(SITE.phone)}
      >
        <PhoneIcon />
        <span>{SITE.phone}</span>
      </a>
    );
  }
  return (
    <a
      className={`bb-btn bb-btn--call ${className}`}
      href={`mailto:${SITE.email}`}
    >
      <MailIcon />
      <span>Email us</span>
    </a>
  );
}

/** Text-message button (sms:) for the business phone. Hidden if no phone. */
export function TextButton({className = ''}: {className?: string}) {
  if (!SITE.phone) return null;
  return (
    <a
      className={`bb-btn bb-btn--outline ${className}`}
      href={`sms:${phoneHref(SITE.phone).replace('tel:', '')}`}
    >
      <span>Text us</span>
    </a>
  );
}

/** Email button (mailto:) for the confirmed public contact address. */
export function EmailButton({className = ''}: {className?: string}) {
  return (
    <a
      className={`bb-btn bb-btn--outline ${className}`}
      href={`mailto:${SITE.email}`}
    >
      <MailIcon />
      <span>Email</span>
    </a>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1L6.6 10.8z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v.5l8 5 8-5V6H4zm16 2.85-7.47 4.67a1 1 0 0 1-1.06 0L4 8.85V18h16V8.85z"
      />
    </svg>
  );
}
