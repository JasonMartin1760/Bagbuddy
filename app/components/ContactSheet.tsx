import {useId, useRef} from 'react';
import {SITE, phoneHref} from '~/config/site';

/**
 * "Contact" button that opens a small sheet with three big buttons:
 * Call, Text and Email (SITE.phone / SITE.email). Shared by the main site
 * and the pickup landing page.
 */
export function ContactSheet({
  label = 'Contact us',
  buttonClassName = 'bb-btn bb-btn--purple bb-btn--lg',
  title = 'How would you like to reach us?',
  emailSubject = 'Pickup request',
}: {
  label?: string;
  buttonClassName?: string;
  title?: string;
  emailSubject?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const tel = SITE.phone ? phoneHref(SITE.phone) : null;
  const sms = tel ? `sms:${tel.replace('tel:', '')}` : null;
  const mail = `mailto:${SITE.email}?subject=${encodeURIComponent(emailSubject)}`;

  return (
    <>
      <button
        type="button"
        className={buttonClassName}
        onClick={() => dialogRef.current?.showModal()}
      >
        {label}
      </button>
      <dialog
        ref={dialogRef}
        className="bb-contact-sheet"
        aria-labelledby={titleId}
      >
        <div className="bb-contact-sheet__inner">
          <h2 id={titleId} className="bb-contact-sheet__title">
            {title}
          </h2>
          <div className="bb-contact-sheet__options">
            {tel ? (
              <a className="bb-contact-sheet__option" href={tel}>
                <span className="bb-contact-sheet__verb">Call</span>
                <span className="bb-contact-sheet__detail">{SITE.phone}</span>
              </a>
            ) : null}
            {sms ? (
              <a className="bb-contact-sheet__option" href={sms}>
                <span className="bb-contact-sheet__verb">Text</span>
                <span className="bb-contact-sheet__detail">{SITE.phone}</span>
              </a>
            ) : null}
            <a className="bb-contact-sheet__option" href={mail}>
              <span className="bb-contact-sheet__verb">Email</span>
              <span className="bb-contact-sheet__detail">{SITE.email}</span>
            </a>
          </div>
          <button
            type="button"
            className="bb-contact-sheet__close"
            onClick={() => dialogRef.current?.close()}
          >
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
