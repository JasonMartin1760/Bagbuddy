import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {findProductPricing, formatUsd} from '~/config/pricing';

/**
 * Product card. For Bag Buddy products (matched by handle or tag) the price
 * comes from app/config/pricing.ts, which takes priority over Shopify.
 */
export function ProductItem({
  product,
  loading,
}: {
  product: CollectionItemFragment | ProductItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const pricing = findProductPricing(product);
  return (
    <Link
      className="product-item bb-product-card"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {image ? (
        <Image
          alt={image.altText || product.title}
          aspectRatio="1/1"
          data={image}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
        />
      ) : (
        <ProductPlaceholderImage />
      )}
      <h3 className="bb-product-card__title">{product.title}</h3>
      <div className="bb-product-card__price">
        {pricing && pricing.price !== null ? (
          <>
            {formatUsd(pricing.price)} <small>{pricing.unit}</small>
          </>
        ) : (
          <Money data={product.priceRange.minVariantPrice} />
        )}
      </div>
    </Link>
  );
}

/** Branded stand-in for products without a photo. */
export function ProductPlaceholderImage() {
  return (
    <div className="bb-product-card__placeholder" aria-hidden="true">
      <picture>
        <source srcSet="/images/bagbuddy-logo-white.avif" type="image/avif" />
        <source srcSet="/images/bagbuddy-logo-white.webp" type="image/webp" />
        <img
          src="/images/bagbuddy-logo-white.png"
          alt=""
          width={640}
          height={304}
          loading="lazy"
        />
      </picture>
    </div>
  );
}
