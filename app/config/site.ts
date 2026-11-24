/**
 * Bag Buddy Dumpsters: site-wide settings.
 *
 * Every value marked TODO(Jason) is a placeholder that still needs a real
 * answer. Leaving a value as `null` is safe: the UI hides or softens the
 * matching element instead of showing made-up information.
 */

export const SITE = {
  name: 'Bag Buddy Dumpsters',
  shortName: 'Bag Buddy',
  /** One-line service description shown under the header's phone row. */
  serviceLine: 'Dumpster bags and pickup service',
  /** Tagline from the logo / branding guide. */
  tagline: 'You bag it up, call us up, we’ll pick it up',

  /** Public contact email shown in the footer and on the booking page. */
  email: 'jandzbagpickup@gmail.com',

  /** Business phone, shown on every click-to-call button. */
  phone: '(719) 419-2257' as string | null,

  /**
   * TODO(Jason): Google review rating and count, e.g. 4.9 and 120.
   * While rating is null the trust bar is hidden.
   */
  googleRating: null as number | null,
  googleReviewCount: null as number | null,
  /** TODO(Jason): link to the Google Business Profile reviews page. */
  googleReviewsUrl: null as string | null,

  /**
   * Hero background image (full-width, behind the zip checker).
   * TODO(Jason): PLACEHOLDER. This is the full-color Bag Buddy logo JPG
   * (upload b72e…jpg) until the real photo of the truck craning/lifting a
   * bag dumpster arrives. To swap it, drop the photo in /public/images and
   * change these three lines. Set `src` to null to use the plain purple
   * gradient instead.
   */
  heroImage: {
    src: '/images/hero-placeholder.webp' as string | null,
    fallbackSrc: '/images/hero-placeholder.jpg' as string | null,
    alt: 'Bag Buddy Dumpsters logo: a crane hook lifting the word Bag',
  },
} as const;

/** Turns a display phone number into a tel: href. */
export function phoneHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `tel:${digits.length === 10 ? `+1${digits}` : `+${digits}`}`;
}

/** Turns a display phone number into an sms: href. */
export function smsHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `sms:${digits.length === 10 ? `+1${digits}` : `+${digits}`}`;
}

/** Where the two main homepage buttons go. */
export const BUY_BAG_PATH = '/products/dumpster-bag';
export const BOOK_PICKUP_PATH = '/book-pickup';

export interface NavItem {
  label: string;
  to: string;
}

/** Main navigation, in the order given in the homepage spec. */
export const NAV_ITEMS: readonly NavItem[] = [
  {label: 'Buy Bags', to: '/collections/all'},
  {label: 'Book a Pickup', to: '/book-pickup'},
  {label: 'Services that we offer', to: '/#services'},
  {label: 'About', to: '/#about'},
  {label: 'Contact', to: '/#contact'},
];
