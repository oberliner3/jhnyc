/**
 * Product Utility Functions
 * Shared utilities for product data manipulation and formatting
 *
 * NOTE: This file contains ONLY pure utility functions that can be used
 * on both client and server. Server-side functions that access the COSMOS
 * API are in separate files to prevent client-side bundle inclusion.
 *
 * For server-side product fetching, see: lib/utils/product-server-utils.ts
 */

/**
 * Format price for merchant feeds (Google/Bing)
 * Returns format: "123.45 USD"
 */
export function formatPriceForMerchant(
  amount: number,
  currency: string = "USD"
): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `${value.toFixed(2)} ${currency}`;
}

/**
 * Format weight in grams for merchant feeds
 * Returns format: "100 g"
 */
export function formatWeight(grams?: number): string {
  const g = typeof grams === "number" && grams > 0 ? grams : 100;
  return `${g} g`;
}

/**
 * Check if a string is likely a GTIN (barcode)
 * Valid lengths: 8, 12, 13, or 14 digits
 */
export function isLikelyGTIN(value?: string): boolean {
  if (!value) return false;
  const digits = value.replace(/\s+/g, "");
  return /^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(digits);
}

/**
 * Normalize product type for consistent formatting
 * Removes leading separators and formats hierarchy
 */
export function normalizeProductType(input?: string): string {
  if (!input) return "General";
  const trimmed = input.trim().replace(/^([>/\-\s])+/, "");
  const parts = trimmed
    .split(/>|\//)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return parts.length ? parts.join(" > ") : "General";
}

/**
 * Get Google Product Category ID from product type
 * Maps common categories to Google taxonomy IDs
 */
export function getGoogleCategory(category: string | undefined): string {
  if (!category) return "166"; // Default: Apparel & Accessories

  const categoryMap: Record<string, string> = {
    electronics: "172",
    clothing: "1604",
    shoes: "187",
    accessories: "166",
    home: "632",
    beauty: "172",
    sports: "499",
    books: "784",
    toys: "220",
    automotive: "888",
    health: "499",
    jewelry: "166",
    bags: "166",
    watches: "166",
    furniture: "632",
    kitchen: "632",
    garden: "632",
    office: "166",
    baby: "2984",
    pet: "1281",
    travel: "166",
    music: "166",
    movies: "166",
    games: "166",
    software: "166",
    tools: "632",
    outdoor: "499",
    fitness: "499",
    art: "166",
    crafts: "166",
    party: "166",
    seasonal: "166",
    clearance: "166",
    sale: "166",
    new: "166",
    featured: "166",
    bestseller: "166",
    trending: "166",
  };

  return categoryMap[category.toLowerCase()] || "166";
}
