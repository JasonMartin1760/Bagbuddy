import type {CachingStrategy, Storefront} from '@shopify/hydrogen';
import {PRODUCT_PRICING, type ProductKind} from '~/config/pricing';

/** A fee product's variant, for the required add-ons / fees step. */
export interface FeeVariant {
  kind: ProductKind;
  id: string;
  availableForSale: boolean;
}

const FEE_VARIANTS_QUERY = `#graphql
  query FeeVariants(
    $country: CountryCode
    $language: LanguageCode
    $electronics: String!
    $mattress: String!
  ) @inContext(country: $country, language: $language) {
    electronics: product(handle: $electronics) {
      selectedOrFirstAvailableVariant {
        id
        availableForSale
      }
    }
    mattress: product(handle: $mattress) {
      selectedOrFirstAvailableVariant {
        id
        availableForSale
      }
    }
  }
` as const;

/**
 * Loads the Large Electronic Device and Mattress / Box Spring fee variants.
 * Never throws: a missing fee product just isn't offered in the step.
 * `cache` defaults to Hydrogen's standard short cache.
 */
export async function loadFeeVariants(
  storefront: Storefront,
  cache?: CachingStrategy,
): Promise<FeeVariant[]> {
  const electronics = PRODUCT_PRICING['electronics-addon'];
  const mattress = PRODUCT_PRICING['mattress-addon'];
  try {
    const data = await storefront.query(FEE_VARIANTS_QUERY, {
      variables: {electronics: electronics.handle, mattress: mattress.handle},
      cache,
    });
    const result: FeeVariant[] = [];
    const e = data.electronics?.selectedOrFirstAvailableVariant;
    if (e) result.push({kind: electronics.kind, ...e});
    const m = data.mattress?.selectedOrFirstAvailableVariant;
    if (m) result.push({kind: mattress.kind, ...m});
    return result;
  } catch (error) {
    console.error(error);
    return [];
  }
}
