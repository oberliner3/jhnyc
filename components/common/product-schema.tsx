import { SITE_CONFIG } from "@/lib/constants";
import type { ApiProduct } from "@/lib/types";
import {
  Product,
  WithContext,
} from "schema-dts";
import Script from "next/script";

export function ProductSchema({ product }: { product: ApiProduct }) {
  if (!product) {
    return null;
  }

  const productSchema: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_CONFIG.url}/products/${product.handle}#product`,
    name: product.title,
    description: product.body_html?.replace(/<[^>]*>?/gm, "").substring(0, 300),
    image: product.images?.[0]?.src || SITE_CONFIG.ogImage,
    url: `${SITE_CONFIG.url}/products/${product.handle}`,
    sku: product.variants?.[0]?.sku || "",
    mpn: product.variants?.[0]?.sku || "",
    brand: {
      "@type": "Brand",
      name: product.vendor || SITE_CONFIG.name,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_CONFIG.url}/products/${product.handle}`,
      priceCurrency: "USD",
      price: product.variants?.[0]?.price || product.price,
      priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        .toISOString()
        .split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability: product.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.review_count || 0,
          bestRating: "5",
          worstRating: "1",
        }
      : undefined,
    category: product.product_type,
  };

  return (
    <Script
      id={`json-ld-product-${product.id ?? product.handle}`}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  );
}
