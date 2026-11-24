import type {CachingStrategy, Storefront} from '@shopify/hydrogen';

/**
 * Cache for product / variant lookups (pickup, fee and product pages):
 * served from Oxygen's cache for 5 minutes, then refreshed in the
 * background (stale-while-revalidate, up to a day) so visitors don't wait
 * on the Storefront API. Price or availability changes in Shopify admin
 * show up within about 5 minutes.
 */
export function productDataCache(storefront: Storefront): CachingStrategy {
  return storefront.CacheCustom({
    mode: 'public',
    maxAge: 300,
    staleWhileRevalidate: 86400,
  });
}
