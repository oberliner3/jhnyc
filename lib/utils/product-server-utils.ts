/**
 * Product Server-Side Utility Functions
 * 
 * Server-side only utilities for product data fetching.
 * These functions access the COSMOS API and should NEVER be imported
 * in client components.
 * 
 * ⚠️ WARNING: Do NOT import this file in client components!
 * Use API routes (e.g., /api/products) instead.
 * 
 * @module lib/utils/product-server-utils
 */

import type { ApiProduct } from "@/lib/types";
import { fetchAllProducts as cosmosClientFetchAll } from "@/lib/api/cosmos-client";

/**
 * Fetch all products with pagination
 * 
 * ⚠️ SERVER-SIDE ONLY - Do not use in client components!
 * 
 * Fetches all products from the COSMOS API with automatic pagination.
 * This function is used by merchant feeds and bulk operations that run
 * on the server.
 * 
 * @param pageSize - Number of products to fetch per page (default: 250)
 * @returns Promise resolving to array of all products
 * 
 * @example
 * ```typescript
 * // In API route or server component
 * import { fetchAllProducts } from "@/lib/utils/product-server-utils";
 * 
 * const products = await fetchAllProducts();
 * ```
 */
export async function fetchAllProducts(
  pageSize: number = 250
): Promise<ApiProduct[]> {
  return cosmosClientFetchAll(pageSize);
}

