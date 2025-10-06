/**
 * COSMOS API Client
 * Modern, type-safe client for the COSMOS product API
 * Supports JSON and MessagePack formats with automatic retry and caching
 *
 * IMPORTANT: This module should only be used in server-side contexts:
 * - Server Components (no "use client" directive)
 * - API Routes
 * - Server Actions
 */

import { logger } from "@/lib/utils/logger";
import type { ApiProduct } from "@/lib/types";

/**
 * Get server-side environment variables
 * Lazy-loaded to prevent client-side access
 */
function getServerConfig() {
  // Dynamic import to ensure this only runs on server
  if (typeof window !== "undefined") {
    throw new Error(
      "COSMOS API client cannot be used on the client side. " +
        "Use API routes (/api/products) instead."
    );
  }

  // Import env only when needed (server-side)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { env } = require("@/lib/env-validation");

  return {
        baseUrl: env.NEXT_PUBLIC_COSMOS_API_BASE_URL,
    apiKey: env.COSMOS_API_KEY,
  };
}

/**
 * Response format options
 */
export type ResponseFormat = "json" | "msgpack";

/**
 * Base request options
 */
export interface CosmosRequestOptions {
  format?: ResponseFormat;
  cache?: RequestCache;
  revalidate?: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  fields?: string;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  products: T[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    total_pages?: number;
  };
}

/**
 * Build full API URL
 */
function buildUrl(endpoint: string): string {
  const { baseUrl } = getServerConfig();
  const base = baseUrl.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}/cosmos${path}`;
}

/**
 * Build request headers
 */
function buildHeaders(format: ResponseFormat = "json"): HeadersInit {
  const { apiKey } = getServerConfig();
  const headers: HeadersInit = {
    "X-API-Key": apiKey,
    "User-Agent": "OriGenZ/1.0",
  };

  if (format === "msgpack") {
    headers["Accept"] = "application/x-msgpack";
  } else {
    headers["Accept"] = "application/json";
  }

  return headers;
}

/**
 * Parse response based on content type
 */
async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("Content-Type") || "";

  if (contentType.includes("application/x-msgpack")) {
    // TODO: Implement MessagePack decoding when needed
    // For now, fall back to JSON
    logger.warn(
      "MessagePack response received but not yet implemented, falling back to JSON"
    );
    return response.json();
  }

  return response.json();
}

/**
 * Core fetch function with error handling
 */
async function cosmosRequest<T>(
  endpoint: string,
  options: CosmosRequestOptions = {}
): Promise<T> {
  const { format = "json", cache = "default", revalidate } = options;
  const url = buildUrl(endpoint);

  logger.debug("COSMOS API request", { endpoint, format });

  try {
    const fetchOptions: RequestInit = {
      headers: buildHeaders(format),
      cache,
      ...(revalidate !== undefined && { next: { revalidate } }),
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `COSMOS API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await parseResponse<T>(response);
    logger.debug("COSMOS API response received", { endpoint });
    return data;
  } catch (error) {
    logger.error("COSMOS API request failed", error, { endpoint, url });
    throw error;
  }
}

/**
 * Get paginated list of products
 */
export async function getProducts(
  params: PaginationParams = {},
  options: CosmosRequestOptions = {}
): Promise<PaginatedResponse<ApiProduct>> {
  const { page = 1, limit = 50, fields } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: Math.min(limit, 100).toString(), // Max 100 per API docs
    ...(fields && { fields }),
    ...(options.format && { format: options.format }),
  });

  return cosmosRequest<PaginatedResponse<ApiProduct>>(
    `/products?${queryParams}`,
    options
  );
}

/**
 * Search for products
 */
export async function searchProducts(
  query: string,
  params: PaginationParams = {},
  options: CosmosRequestOptions = {}
): Promise<PaginatedResponse<ApiProduct>> {
  const { page = 1, limit = 50, fields } = params;

  const queryParams = new URLSearchParams({
    q: query,
    page: page.toString(),
    limit: Math.min(limit, 100).toString(),
    ...(fields && { fields }),
    ...(options.format && { format: options.format }),
  });

  return cosmosRequest<PaginatedResponse<ApiProduct>>(
    `/products/search?${queryParams}`,
    options
  );
}

/**
 * Get single product by ID or handle
 */
export async function getProduct(
  key: string,
  options: CosmosRequestOptions = {}
): Promise<{ product: ApiProduct }> {
  const queryParams = new URLSearchParams({
    ...(options.format && { format: options.format }),
  });

  const query = queryParams.toString() ? `?${queryParams}` : "";
  return cosmosRequest<{ product: ApiProduct }>(
    `/products/${key}${query}`,
    options
  );
}

/**
 * Get products from a collection
 */
export async function getCollection(
  handle: string,
  params: PaginationParams = {},
  options: CosmosRequestOptions = {}
): Promise<PaginatedResponse<ApiProduct>> {
  const { page = 1, limit = 50, fields } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: Math.min(limit, 100).toString(),
    ...(fields && { fields }),
    ...(options.format && { format: options.format }),
  });

  return cosmosRequest<PaginatedResponse<ApiProduct>>(
    `/collections/${handle}?${queryParams}`,
    options
  );
}

/**
 * Get image URL through CDN proxy
 */
export function getImageUrl(path: string): string {
  const { baseUrl } = getServerConfig();
  const base = baseUrl.replace(/\/$/, "");
  const imagePath = path.startsWith("/") ? path : `/${path}`;
  return `${base}/cosmos/cdn${imagePath}`;
}

/**
 * Fetch all products with pagination (for feeds, etc.)
 */
export async function fetchAllProducts(
  pageSize: number = 250
): Promise<ApiProduct[]> {
  const allProducts: ApiProduct[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await getProducts(
      { page, limit: pageSize },
      { cache: "no-store" } // Don't cache bulk operations
    );

    if (!response.products || response.products.length === 0) {
      break;
    }

    allProducts.push(...response.products);

    // Check if there are more pages
    if (response.products.length < pageSize) {
      hasMore = false;
    } else {
      page++;
    }

    logger.debug(`Fetched page ${page - 1}`, {
      count: response.products.length,
      total: allProducts.length,
    });
  }

  return allProducts;
}
