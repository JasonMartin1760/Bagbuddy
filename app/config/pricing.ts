import type {ServiceAreaId} from '~/data/serviceAreaList';

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

/** Products sold on the Buy Bags page. */
export type ShopProductKind =
  | 'dumpster-bag'
  | 'electronics-addon'
  | 'mattress-addon';

/** One pickup-service product per service area (priced by county). */
export type PickupKind = 'pickup-colorado-springs' | 'pickup-woodland-park';

export type ProductKind = ShopProductKind | PickupKind;

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
  /** Service area, for pickup products. */
  area?: ServiceAreaId;
}

/**
 * Starting pickup price per service area (USD), by county via zip code.
 * Jason confirmed: Colorado Springs area (El Paso County) $130, Woodland
 * Park area (Teller County) $150.
 * Denver metro is not served yet ("coming soon"), so it has no price and
 * no pickup product. TODO(Jason): set a price when Denver opens.
 */
export const PICKUP_STARTING_PRICE: Record<ServiceAreaId, number | null> = {
  'colorado-springs': 130,
  'woodland-park': 150,
  'denver-metro': null,
};

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
  'pickup-colorado-springs': {
    kind: 'pickup-colorado-springs',
    handle: 'pickup-colorado-springs',
    tag: 'bagbuddy-pickup-colorado-springs',
    title: 'Bag Pickup – Colorado Springs Area',
    label: 'Pickup, Colorado Springs area (El Paso County)',
    price: PICKUP_STARTING_PRICE['colorado-springs'],
    unit: 'starting price, per bag',
    area: 'colorado-springs',
  },
  'pickup-woodland-park': {
    kind: 'pickup-woodland-park',
    handle: 'pickup-woodland-park',
    tag: 'bagbuddy-pickup-woodland-park',
    title: 'Bag Pickup – Woodland Park Area',
    label: 'Pickup, Woodland Park area (Teller County)',
    price: PICKUP_STARTING_PRICE['woodland-park'],
    unit: 'starting price, per bag',
    area: 'woodland-park',
  },
};

export const PRODUCT_KINDS = Object.keys(PRODUCT_PRICING) as ProductKind[];

/** The products shown on the Buy Bags page, in order. */
export const SHOP_PRODUCT_KINDS: readonly ShopProductKind[] = [
  'dumpster-bag',
  'electronics-addon',
  'mattress-addon',
];

export const PICKUP_KIND_BY_AREA: Partial<Record<ServiceAreaId, PickupKind>> = {
  'colorado-springs': 'pickup-colorado-springs',
  'woodland-park': 'pickup-woodland-park',
};

/** Pickup product for a served area (undefined for coming-soon areas). */
export function getPickupPricing(
  area: ServiceAreaId,
): ProductPricing | undefined {
  const kind = PICKUP_KIND_BY_AREA[area];
  return kind ? PRODUCT_PRICING[kind] : undefined;
}

export function isPickupKind(kind: ProductKind): kind is PickupKind {
  return kind.startsWith('pickup-');
}

/** Fees shown in the homepage "Additional Fees" list. */
export const ADDITIONAL_FEES: readonly ProductPricing[] = [
  PRODUCT_PRICING['electronics-addon'],
  PRODUCT_PRICING['mattress-addon'],
];

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

/** Lowest pickup price across served areas (for "starting at" copy). */
export const LOWEST_PICKUP_PRICE: number | null = (() => {
  const prices = Object.values(PICKUP_STARTING_PRICE).filter(
    (price): price is number => price !== null,
  );
  return prices.length ? Math.min(...prices) : null;
})();
