/**
 * Homepage and product copy, taken from Jason's homepage spec (PDF).
 * Wording is kept as written; only obvious typos in customer-facing text
 * were fixed. Jason's call: the PDF's "Durabag" wording is now
 * "Bag Buddy" / "dumpster bag" (one term site-wide).
 */
import type {ProductKind} from '~/config/pricing';
import {PRODUCT_PRICING, findProductPricing, formatUsd} from '~/config/pricing';

export const ALLOWED = {
  title: "What's Allowed in Your Dumpster Bag",
  intro:
    "Most household and construction junk is welcome – here's what you need to know before you buy or fill your bag.",
  allowed: [
    'General household items',
    'Furniture',
    'Yard waste',
    'Construction debris',
  ],
  notAllowed: [
    'Hazardous waste such as paints, chemicals, solvents, pesticides, or household cleaners',
    'Used oil or automotive fluids',
    'Batteries (car batteries, lead-acid batteries, etc.)',
    'Tires',
    'Infectious or medical waste',
  ],
  conditional: [
    'Paint cans: only if the paint is completely dried out and the lid is removed.',
  ],
} as const;

export const PLACEMENT = {
  title: 'Where Can I Place My Bag Buddy Dumpster?',
  points: [
    "You can place your dumpster bag almost anywhere on your property as long as it doesn't obstruct sidewalks or roadways.",
    'Our heavy-duty dually pickup trucks with cranes need roughly 9–10 feet of width (about the width of a standard driveway or parking spot).',
    'We can back into most driveways and reach about 8 feet off the back of the truck.',
    "There must be a clear, safe path for the truck and the surface must be strong enough to support the truck's weight.",
    'Alleys are welcome — our smaller trucks allow us to safely and conveniently pick up from alleys where many larger trucks cannot.',
  ],
} as const;

export const HOW_FULL = {
  title: 'How Full Can I Fill My Bag Buddy Dumpster?',
  points: [
    'You can fill the bag completely full as long as the handles reach together or can be tied together as well. This is required so our crane can hook onto the bag safely.',
    'For normal household junk and typical construction debris, you can fill it all the way up.',
    "For heavy material such as dirt, rock, or concrete, do not exceed the bag's 3300 lb weight capacity — even if the handles still reach together.",
  ],
  capacityLbs: 3300,
} as const;

export const HOW_IT_WORKS = [
  {title: 'Buy the bag', text: 'Order online and we ship it to you.'},
  {title: 'Fill the bag', text: 'Fill it on your own time, at your own pace.'},
  {
    title: 'Schedule pickup',
    text: 'Book a pickup and our crane truck hauls it away. We pick up most bags within three business days.',
  },
] as const;

/** "Why choose a dumpster bag?" section (reworded from the PDF's comparison). */
export const WHY_DUMPSTER_BAG = {
  title: 'Why Choose a Dumpster Bag?',
  intro:
    'A traditional metal dumpster comes with a rental window, a delivery appointment and sometimes a permit. A dumpster bag works around your schedule instead.',
  points: [
    'Get it when you need it: buy a bag and start filling, with no rental clock running.',
    'Fill it at your own pace, whether that takes a weekend or a few weeks.',
    'Place it almost anywhere our pickup trucks can back up to, including alleys.',
    'Great for moving, small renovations, yard cleanups and weekend projects.',
    "When it's full, schedule a pickup and our crane truck hauls it away.",
  ],
} as const;

/** About section: Jason's story, in his words, tidied for the website. */
export const ABOUT = {
  title: 'About Bag Buddy',
  paragraphs: [
    "I got into dumpster bags back when I was a contractor installing windows and doors. I used the bags myself twice a week, and I ended up building a crane to pick up my own. That's how Bag Buddy got started.",
    "I'm just a local guy who owns the company. It's a very small operation: just me and one truck with a crane on it, and I love doing it. I love providing a service, and giving the best service I can to the people who need it, especially when a dumpster bag is the right fit for the job.",
  ],
  /** Sign-off under the story. */
  signature: 'Jason, owner of Bag Buddy',
} as const;

/** Intro on the pickup add-ons step. */
export const PICKUP_FEES_INTRO =
  "Add one fee for each item that's in your dumpster bag.";

/** Subtext under "Extra item charges" (Jason's wording). */
export const PICKUP_FEES_SUBTEXT =
  'These additional disposal fees only apply if you are disposing of these items.';

export type ContentBlock =
  | {type: 'list'; title: string; items: readonly string[]}
  | {type: 'allowed'}
  | {type: 'text'; title: string; body: string};

export interface ProductContent {
  kind: ProductKind | 'generic';
  summary: string;
  highlights: readonly string[];
  blocks: readonly ContentBlock[];
}

const BAG_CONTENT: ProductContent = {
  kind: 'dumpster-bag',
  summary:
    'A heavy-duty dumpster bag shipped to your door. Fill it on your own time, then book a pickup and our crane truck hauls it away.',
  highlights: [
    `${HOW_FULL.capacityLbs.toLocaleString('en-US')} lb weight capacity`,
    'Shipped to you',
    'Fill it on your own time — no rental deadlines',
    'Pickup booked separately and priced by zip code',
  ],
  blocks: [
    {type: 'list', title: HOW_FULL.title, items: HOW_FULL.points},
    {type: 'allowed'},
    {type: 'list', title: PLACEMENT.title, items: PLACEMENT.points},
  ],
};

const FEE_NOTE =
  'Add this to your order for each item in your bag so we can dispose of it properly at pickup.';

const CONTENT_BY_KIND: Record<ProductKind | 'generic', ProductContent> = {
  'dumpster-bag': BAG_CONTENT,
  'electronics-addon': {
    kind: 'electronics-addon',
    summary: `Large electronic devices (TVs, etc.) need special handling. ${FEE_NOTE}`,
    highlights: ['Charged per device', 'TVs and other large electronics'],
    blocks: [
      {type: 'list', title: HOW_FULL.title, items: HOW_FULL.points},
      {type: 'allowed'},
    ],
  },
  'mattress-addon': {
    kind: 'mattress-addon',
    summary: `Mattresses and box springs are charged apiece (each one). ${FEE_NOTE}`,
    highlights: ['Charged per mattress or box spring'],
    blocks: [
      {type: 'list', title: HOW_FULL.title, items: HOW_FULL.points},
      {type: 'allowed'},
    ],
  },
  'pickup-colorado-springs': pickupContent(
    'pickup-colorado-springs',
    'the Colorado Springs area (El Paso County)',
  ),
  'pickup-woodland-park': pickupContent(
    'pickup-woodland-park',
    'the Woodland Park area (Teller County)',
  ),
  generic: {...BAG_CONTENT, kind: 'generic'},
};

function pickupContent(kind: ProductKind, where: string): ProductContent {
  return {
    kind,
    summary: `Crane-truck pickup of your filled dumpster bag in ${where}. Pickup is priced by county, based on your zip code.`,
    highlights: [
      'Priced by your zip code’s county',
      'Our crane truck lifts the bag from your driveway or alley',
      'Add-on fees apply for TVs and mattresses',
      'We pick up most bags within three business days',
    ],
    blocks: [
      {type: 'list', title: PLACEMENT.title, items: PLACEMENT.points},
      {type: 'list', title: HOW_FULL.title, items: HOW_FULL.points},
      {type: 'allowed'},
    ],
  };
}

/** Content for a product, matched by handle or tag; falls back to bag copy. */
export function getProductContent(product: {
  handle: string;
  tags?: readonly string[] | null;
}): ProductContent {
  const pricing = findProductPricing(product);
  return CONTENT_BY_KIND[pricing?.kind ?? 'generic'];
}

export function getContentByKind(kind: ProductKind): ProductContent {
  return CONTENT_BY_KIND[kind];
}
