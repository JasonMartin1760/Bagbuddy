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

  /**
   * Main product image on the Buy a Bag page (a local static file, so it always
   * shows even though the store's product image isn't reachable from here).
   * TODO(Jason): PLACEHOLDER. This photo is Sandbag Express's product image
   * (cropped from sandbagexpress.com). Replace it with your own photo of the
   * bag: drop it in /public/images and update these lines.
   */
  bagImage: {
    src: '/images/bag-yellow-dumpster-bag.webp',
    fallbackSrc: '/images/bag-yellow-dumpster-bag.jpg',
    alt: 'Bag Buddy yellow dumpster bag',
    width: 1000,
    height: 1000,
  },

  /**
   * Jason's own photo of the Bag Buddy truck craning a full bag (sky cropped,
   * resized to 1200px tall, metadata stripped). Used in About and How It Works.
   */
  truckImage: {
    src: '/images/bag-buddy-crane-truck.webp',
    fallbackSrc: '/images/bag-buddy-crane-truck.jpg',
    alt: 'Bag Buddy crane truck lifting a full dumpster bag in Colorado Springs',
    width: 782,
    height: 1200,
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
  /** Only in the hamburger menu (too long for the desktop header row). */
  menuOnly?: boolean;
}

/** Main navigation (header and hamburger menu). */
export const NAV_ITEMS: readonly NavItem[] = [
  {label: 'Buy Bags', to: BUY_BAG_PATH},
  {label: 'Book a Pickup', to: BOOK_PICKUP_PATH},
  {label: 'What’s allowed in the bag?', to: '/#allowed', menuOnly: true},
  {label: 'Where can I place the bag?', to: '/#placement', menuOnly: true},
  {
    label: 'Why choose a bag dumpster?',
    to: '/#why-bag-dumpster',
    menuOnly: true,
  },
  {label: 'About', to: '/#about'},
  {label: 'Contact', to: '/#contact'},
];
