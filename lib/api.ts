/**
 * API client for Cosmos API integration
 * Base URL: http://localhost:8000
 */

import { SITE_CONFIG } from "./constants";
import type { ApiProduct } from "./types";

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${SITE_CONFIG.api}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "User-Agent": "ua-x-originz/1.0.0",
    },
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `API request failed with status ${response.status}: ${errorBody}`
    );
  }
  return response.json();
}

/**
 * Get all products
 */
export async function getAllProducts(options?: {
  limit?: number;
  page?: number;
}): Promise<ApiProduct[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.page) params.append("page", options.page.toString());

  const queryString = params.toString();
  const endpoint = queryString ? `/products?${queryString}` : "/products";

  try {
    const data = await apiRequest<{ products: ApiProduct[] }>(endpoint);
    return Array.isArray(data.products) ? data.products : [];
  } catch (error) {
    console.warn(`[API] Failed to fetch products from ${endpoint}:`, error);
    return [];
  }
}

/**
 * Search products by query
 */
export async function searchProducts(query: string): Promise<ApiProduct[]> {
  const encodedQuery = encodeURIComponent(query);
  try {
    const data = await apiRequest<{ products: ApiProduct[] }>(
      `/products/search?q=${encodedQuery}`
    );
    return Array.isArray(data.products) ? data.products : [];
  } catch (error) {
    console.warn(`[API] Failed to search products for "${query}":`, error);
    return [];
  }
}

/**
 * Get a specific product by ID
 */
export async function getProductById(id: string): Promise<ApiProduct> {
  return await apiRequest<ApiProduct>(`/products/${id}`);
}

/**
 * Get a specific product by handle
 */
export async function getProductByHandle(handle: string): Promise<ApiProduct> {
  return await apiRequest<ApiProduct>(`/products/${handle}`);
}

/**
 * Get products filtered by vendor
 */
export async function getProductsByVendor(
  vendor: string
): Promise<ApiProduct[]> {
  const encodedVendor = encodeURIComponent(vendor);
  try {
    const data = await apiRequest<{ products: ApiProduct[] }>(
      `/products?vendor=${encodedVendor}`
    );
    return Array.isArray(data.products) ? data.products : [];
  } catch (error) {
    console.warn(
      `[API] Failed to fetch products for vendor "${vendor}":`,
      error
    );
    return [];
  }
}

/**
 * Get image proxy URL
 * TODO: Fix
 */
export function getImageProxyUrl(imageUrl: string): string {
  const encodedUrl = encodeURIComponent(imageUrl);
  return `${SITE_CONFIG.api}/cosmos/image-proxy?url=${encodedUrl}`;
}
