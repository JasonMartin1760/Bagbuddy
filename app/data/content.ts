/**
 * Homepage and product copy, taken from Jason's homepage spec (PDF).
 * Wording is kept as written; only obvious typos in customer-facing text
 * were fixed. "Durabag" is kept where the PDF uses it.
 * TODO(Jason): confirm "Durabag" vs "Bag Buddy" wording.
 */
import type {ProductKind} from '~/config/pricing';
import {findProductPricing} from '~/config/pricing';

export const ALLOWED = {
  title: "What's Allowed in Your Durabag Dumpster",
  intro:
    "Most household and construction junk is welcome – here's what you need to know before you buy or fill your bag.",
  allowed: [
    'General household items',
    'Furniture',
    'Yard waste',
    'Construction debris',
  ],
  notAllowed: [
    'Hazardous waste (paint, chemicals, solvents, pesticides, household cleaners). Empty cans with the lid off, such as paint cans, are fine.',
    'Any liquids or containers with free liquids',
    'Used oil or automotive fluids',
    'Batteries (car batteries, lead-acid batteries, etc.)',
    'Tires',
    'Infectious or medical waste',
  ],
} as const;

export const PLACEMENT = {
  title: 'Where Can I Place My Bag Buddy Dumpster?',
  points: [
    "You can place your Durabag almost anywhere on your property as long as it doesn't obstruct sidewalks or roadways.",
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
    "For heavy material such as dirt, rock, or concrete, do not exceed the bag's 3300 lb weight capacity — even if you can still tie the handles.",
  ],
  capacityLbs: 3300,
} as const;

export const HOW_IT_WORKS = [
  {title: 'Buy the bag', text: 'Order online and we ship it to you.'},
  {title: 'Fill the bag', text: 'Fill it on your own time, at your own pace.'},
  {
    title: 'Schedule pickup',
    text: 'Book a pickup and our crane truck hauls it away.',
  },
] as const;

export const WHY_DURABAG = {
  title: 'Why Choose a Durabag Instead of a Traditional Dumpster?',
  body: "Traditional metal dumpsters lock you into strict schedules, possible permit headaches, and deadlines. A Durabag is different. You get it exactly when you need it, where you need it, place it anywhere our full-size pickups can back up to, and fill it on your own time — perfect for moving, small renovations, or weekend projects. It's flexible junk removal that works around your life instead of forcing you to work around it.",
} as const;

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
