import { ApiProduct, ApiProductVariant } from "@/lib/types";

export type MerchantFeedType = "google" | "bing";
export type FlexibleApiProductVariant = Omit<
  ApiProductVariant,
  "featured_image"
> & {
  featured_image?: string | { src: string };
};
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
export interface FeedGenerationError {
  productId: string | number;
  variantId?: string | number;
  message: string;
}

export interface ProcessProductVariantsResult {
  items: string[];
  errors: FeedGenerationError[];
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
export interface ApiProductWithRaw extends ApiProduct {
  raw_json?: string;
}
