/**
 * Merchant Feed Utilities
 * Shared utilities for generating product feeds for Google and Bing Merchant Centers
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
 * Handles option1, option2, option3 mapping
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
 * Calculate pricing information for a variant
 */
export interface VariantPricing {
  basePrice: string;
  salePrice: string | null;
}

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
 */
export function getVariantImageUrl(
  variant: ApiProductVariant,
  product: ApiProduct,
  fallbackUrl: string
): string {
  return variant.featured_image || product.images?.[0]?.src || fallbackUrl;
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
export function processProductVariants(
  product: ApiProduct | ApiProductWithRaw,
  siteUrl: string,
  siteName: string,
  shippingConfig?: {
    country: string;
    service: string;
    price: string;
  }
): string[] {
  const items: string[] = [];

  try {
    const productData = parseProductData(product);
    const variants = productData.variants || [];
    const options = productData.options || [];

    if (!variants || variants.length === 0) {
      return items;
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
        console.error(`Error processing variant ${variant.id}:`, variantError);
      }
    }
  } catch (productError) {
    console.error(`Error processing product ${product.id}:`, productError);
  }

  return items;
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
