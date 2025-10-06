/**
 * Merchant Feed Utilities
 *
 * Shared utilities for generating product feeds for Google and Bing Merchant Centers.
 * These utilities handle the transformation of product data into XML feed format
 * compliant with Google Merchant Center and Bing Merchant Center specifications.
 *
 * @module lib/utils/merchant-feed-utils
 * @see https://support.google.com/merchants/answer/7052112
 * @see https://help.ads.microsoft.com/apex/index/3/en/51084
 */

import type {
  ApiProduct,
  ApiProductVariant,
  ApiProductOption,
} from "@/lib/types";
import { escapeXml, stripHtml } from "./xml-utils";
import {
  formatPriceForMerchant,
  formatWeight,
  isLikelyGTIN,
  normalizeProductType,
  getGoogleCategory,
} from "./product-utils";

/**
 * Extract option value by name from variant
 *
 * Handles the mapping between option names (e.g., "Color", "Size") and the
 * variant's option1, option2, option3 fields. This is necessary because
 * product options are stored as indexed fields in the API response.
 *
 * @param variant - The product variant containing option values
 * @param options - Array of product options with names and positions
 * @param optionName - The name of the option to extract (case-insensitive)
 * @returns The option value for the variant, or empty string if not found
 *
 * @example
 * ```typescript
 * const color = getVariantOptionValue(variant, options, "color");
 * // Returns: "Red" (from variant.option1 if Color is first option)
 * ```
 */
export function getVariantOptionValue(
  variant: ApiProductVariant,
  options: ApiProductOption[],
  optionName: string
): string {
  const option = options.find(
    (opt) => opt.name.toLowerCase() === optionName.toLowerCase()
  );

  if (!option) {
    return "";
  }

  const optionIndex = options.indexOf(option);

  switch (optionIndex) {
    case 0:
      return variant.option1 || "";
    case 1:
      return variant.option2 || "";
    case 2:
      return variant.option3 || "";
    default:
      return "";
  }
}

/**
 * Variant pricing information for merchant feeds
 */
export interface VariantPricing {
  /** The regular/base price in merchant feed format (e.g., "29.99 USD") */
  basePrice: string;
  /** The sale price if on sale, null otherwise */
  salePrice: string | null;
}

/**
 * Calculate pricing for variant
 *
 * Determines the base price and sale price for a product variant.
 * If the variant has a compare_at_price that's higher than the current price,
 * the compare_at_price becomes the base price and the current price becomes
 * the sale price (indicating a discount).
 *
 * @param variant - The product variant with pricing information
 * @returns Object containing formatted base price and sale price
 *
 * @example
 * ```typescript
 * const pricing = calculateVariantPricing(variant);
 * // Returns: { basePrice: "49.99 USD", salePrice: "29.99 USD" }
 * // Or: { basePrice: "29.99 USD", salePrice: null } (not on sale)
 * ```
 */
export function calculateVariantPricing(
  variant: ApiProductVariant
): VariantPricing {
  const priceNum = variant.price;
  const compareNum = variant.compare_at_price;

  let baseAmount: number = priceNum;
  let salePrice: string | null = null;

  // If there's a compare_at_price that's higher, it's on sale
  if (typeof compareNum === "number" && compareNum > priceNum) {
    baseAmount = compareNum;
    salePrice = formatPriceForMerchant(priceNum);
  }

  return {
    basePrice: formatPriceForMerchant(baseAmount),
    salePrice,
  };
}

/**
 * Get the best image URL for a variant
 *
 * Attempts to find the most appropriate image for a product variant,
 * falling back through multiple sources if needed.
 *
 * Priority order:
 * 1. Variant's featured image (if set)
 * 2. Product's first image
 * 3. Fallback URL (placeholder)
 *
 * @param variant - The product variant
 * @param product - The parent product
 * @param fallbackUrl - URL to use if no image is found
 * @returns The best available image URL
 *
 * @example
 * ```typescript
 * const imageUrl = getVariantImageUrl(variant, product, "/placeholder.svg");
 * // Returns: "https://cdn.example.com/variant-image.jpg"
 * ```
 */
type FlexibleApiProductVariant = Omit<ApiProductVariant, 'featured_image'> & {
  featured_image?: string | { src: string };
};

export function getVariantImageUrl(
  variant: ApiProductVariant,
  product: ApiProduct,
  fallbackUrl: string
): string {
  const flexVariant = variant as FlexibleApiProductVariant;
  const featuredImage = flexVariant.featured_image;

  if (featuredImage && typeof featuredImage === 'object' && featuredImage.src) {
    return featuredImage.src;
  }
  if (typeof featuredImage === 'string') {
    return featuredImage;
  }
  return product.images?.[0]?.src || fallbackUrl;
}

/**
 * Build merchant feed item data
 */
export interface MerchantFeedItemData {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  availability: "in stock" | "out of stock";
  price: string;
  salePrice: string | null;
  brand: string;
  condition: "new" | "used" | "refurbished";
  productType: string;
  googleProductCategory: string;
  mpn: string;
  gtin: string;
  color: string;
  size: string;
  shippingWeight: string;
}

export function buildMerchantFeedItemData(
  product: ApiProduct,
  variant: ApiProductVariant,
  options: ApiProductOption[],
  siteUrl: string,
  siteName: string
): MerchantFeedItemData {
  const pricing = calculateVariantPricing(variant);
  const color = getVariantOptionValue(variant, options, "color");
  const size = getVariantOptionValue(variant, options, "size");
  const productType = normalizeProductType(product.product_type);
  const weight = formatWeight(variant.grams);
  const gtin = isLikelyGTIN(variant.sku) ? variant.sku || "" : "";

  return {
    id: String(variant.id),
    title: `${product.title} - ${variant.title}`,
    description: stripHtml(product.body_html) || product.title,
    link: `${siteUrl}/products/${product.handle}?variant=${variant.id}`,
    imageLink: getVariantImageUrl(
      variant,
      product,
      `${siteUrl}/placeholder.svg`
    ),
    availability: variant.available ? "in stock" : "out of stock",
    price: pricing.basePrice,
    salePrice: pricing.salePrice,
    brand: product.vendor || siteName,
    condition: "new",
    productType,
    googleProductCategory: getGoogleCategory(product.product_type),
    mpn: variant.sku || String(variant.id),
    gtin,
    color,
    size,
    shippingWeight: weight,
  };
}

/**
 * Generate XML item for Google/Bing Merchant feed
 */
export function generateMerchantFeedXmlItem(
  data: MerchantFeedItemData,
  shippingConfig?: {
    country: string;
    service: string;
    price: string;
  }
): string {
  const defaultShipping = shippingConfig || {
    country: "US",
    service: "Standard",
    price: "9.99 USD",
  };

  return `
    <item>
      <title><![CDATA[${data.title}]]></title>
      <link>${escapeXml(data.link)}</link>
      <description><![CDATA[${data.description}]]></description>
      <g:id>${escapeXml(data.id)}</g:id>
      <g:title><![CDATA[${data.title}]]></g:title>
      <g:description><![CDATA[${data.description}]]></g:description>
      <g:link>${escapeXml(data.link)}</g:link>
      <g:image_link>${escapeXml(data.imageLink)}</g:image_link>
      <g:availability>${data.availability}</g:availability>
      <g:price>${escapeXml(data.price)}</g:price>
      ${
        data.salePrice
          ? `<g:sale_price>${escapeXml(data.salePrice)}</g:sale_price>`
          : ""
      }
      <g:brand>${escapeXml(data.brand)}</g:brand>
      <g:condition>${data.condition}</g:condition>
      <g:product_type>${escapeXml(data.productType)}</g:product_type>
      <g:google_product_category>${escapeXml(
        data.googleProductCategory
      )}</g:google_product_category>
      <g:mpn>${escapeXml(data.mpn)}</g:mpn>
      ${data.gtin ? `<g:gtin>${escapeXml(data.gtin)}</g:gtin>` : ""}
      ${data.color ? `<g:color>${escapeXml(data.color)}</g:color>` : ""}
      ${data.size ? `<g:size>${escapeXml(data.size)}</g:size>` : ""}
      <g:shipping_weight>${escapeXml(data.shippingWeight)}</g:shipping_weight>
      <g:shipping>
        <g:country>${defaultShipping.country}</g:country>
        <g:service>${defaultShipping.service}</g:service>
        <g:price>${defaultShipping.price}</g:price>
      </g:shipping>
    </item>`;
}

/**
 * Parse product with raw_json field
 */
export interface ApiProductWithRaw extends ApiProduct {
  raw_json?: string;
}

export function parseProductData(
  product: ApiProduct | ApiProductWithRaw
): ApiProduct {
  const raw = (product as ApiProductWithRaw).raw_json;
  return raw ? (JSON.parse(raw) as ApiProduct) : (product as ApiProduct);
}

/**
 * Process all variants for a product and generate feed items
 */
export interface FeedGenerationError {
  productId: string | number;
  variantId?: string | number;
  message: string;
}

export interface ProcessProductVariantsResult {
  items: string[];
  errors: FeedGenerationError[];
}

export function processProductVariants(
  product: ApiProduct | ApiProductWithRaw,
  siteUrl: string,
  siteName: string,
  shippingConfig?: {
    country: string;
    service: string;
    price: string;
  }
): ProcessProductVariantsResult {
  const items: string[] = [];
  const errors: FeedGenerationError[] = [];

  try {
    const productData = parseProductData(product);
    const variants = productData.variants || [];
    const options = productData.options || [];

    if (!variants || variants.length === 0) {
      return { items, errors };
    }

    for (const variant of variants) {
      try {
        const itemData = buildMerchantFeedItemData(
          productData,
          variant,
          options,
          siteUrl,
          siteName
        );

        const xmlItem = generateMerchantFeedXmlItem(itemData, shippingConfig);
        items.push(xmlItem);
      } catch (variantError) {
        errors.push({
          productId: product.id,
          variantId: variant.id,
          message:
            variantError instanceof Error
              ? variantError.message
              : "Unknown variant error",
        });
      }
    }
  } catch (productError) {
    errors.push({
      productId: product.id,
      message:
        productError instanceof Error
          ? productError.message
          : "Unknown product error",
    });
  }

  return { items, errors };
}

/**
 * Generate complete merchant feed XML
 */
export function generateMerchantFeedXml(
  items: string[],
  siteName: string,
  siteUrl: string,
  feedDescription: string
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(siteName)} - Product Feed</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(feedDescription)}</description>
    ${items.join("")}
  </channel>
</rss>`;
}
