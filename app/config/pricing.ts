import type {ServiceAreaId} from '~/data/serviceAreas';

/**
 * Bag Buddy Dumpsters: authoritative prices.
 *
 * Prices Jason has stated take priority over whatever the Shopify store
 * returns. The storefront always DISPLAYS these numbers for the matching
 * products. NOTE: the cart and checkout still charge the Shopify price, so
 * the products in Shopify admin must be set to the same amounts.
 *
 * Do not add numbers here that Jason has not confirmed.
 */

export type ProductKind =
  | 'dumpster-bag'
  | 'electronics-addon'
  | 'mattress-addon';

export interface ProductPricing {
  kind: ProductKind;
  /** Suggested Shopify product handle. */
  handle: string;
  /** Product tag that also links a Shopify product to this entry. */
  tag: string;
  title: string;
  /** Plain-language label used in fee lists. */
  label: string;
  /** Price in USD, or null when not set yet. */
  price: number | null;
  /** Short unit label shown after the price. */
  unit: string;
}

export const PRODUCT_PRICING: Record<ProductKind, ProductPricing> = {
  'dumpster-bag': {
    kind: 'dumpster-bag',
    handle: 'dumpster-bag',
    tag: 'bagbuddy-bag',
    title: 'Dumpster Bag',
    label: 'Dumpster bag (shipped to you)',
    // Jason clarified the PDF's "$30" line is the price of the bag itself,
    // shipped to the customer.
    price: 30,
    unit: 'each, shipped to you',
  },
  'electronics-addon': {
    kind: 'electronics-addon',
    handle: 'large-electronic-device-fee',
    tag: 'bagbuddy-electronics',
    title: 'Large Electronic Device Add-on',
    label: 'Large electronic devices (TVs, etc.)',
    price: 35,
    unit: 'each',
  },
  'mattress-addon': {
    kind: 'mattress-addon',
    handle: 'mattress-box-spring-fee',
    tag: 'bagbuddy-mattress',
    title: 'Mattress or Box Spring Add-on',
    label: 'Mattresses or box springs',
    price: 80,
    unit: 'apiece (each one)',
  },
};

export const PRODUCT_KINDS = Object.keys(PRODUCT_PRICING) as ProductKind[];

/** Fees shown in the homepage "Additional Fees" list. */
export const ADDITIONAL_FEES: readonly ProductPricing[] = [
  PRODUCT_PRICING['electronics-addon'],
  PRODUCT_PRICING['mattress-addon'],
];

/**
 * TODO(Jason): starting pickup price per service area (USD).
 * While null, a served zip shows "Call or book for your pickup price"
 * instead of a dollar amount.
 */
export const PICKUP_STARTING_PRICE: Record<ServiceAreaId, number | null> = {
  'colorado-springs': null,
  'woodland-park': null,
  'denver-metro': null,
};

/** Finds the price entry for a Shopify product by handle or tag. */
export function findProductPricing(product: {
  handle: string;
  tags?: readonly string[] | null;
}): ProductPricing | undefined {
  const tags = (product.tags ?? []).map((tag) => tag.toLowerCase());
  return PRODUCT_KINDS.map((kind) => PRODUCT_PRICING[kind]).find(
    (entry) => entry.handle === product.handle || tags.includes(entry.tag),
  );
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}
