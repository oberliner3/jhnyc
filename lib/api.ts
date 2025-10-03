/**
 * Enhanced API client for Cosmos API integration
 * Includes comprehensive error handling, retry logic, and type safety
 */

import { LIMITS } from "./constants";
import { createApiResponse, type ApiResponse, ApiClientError } from "./errors";
import type { ApiProduct } from "./types";
import { apiClient } from "@/lib/utils/api-client";

/**
 * Get all products with backward compatibility
 * Returns a plain array for backward compatibility while also providing enhanced error handling
 */
export async function getAllProducts(options?: {
	limit?: number;
	page?: number;
}): Promise<ApiProduct[]> {
	// Validate parameters
	const limit =
		options?.limit && options.limit > 0
			? Math.min(options.limit, 100)
			: LIMITS.PRODUCTS_PER_PAGE;
	const page = options?.page && options.page > 0 ? options.page : 1;

	const params = new URLSearchParams();
	params.append("limit", limit.toString());
	params.append("page", page.toString());

	const endpoint = `/products?${params.toString()}`;

	try {
		const data = await apiClient<{ products: ApiProduct[] }>(endpoint);
		const products = Array.isArray(data.products) ? data.products : [];
		// Force all products to in_stock: true
		return products.map((p) => ({ ...p, in_stock: true }));
	} catch (error) {
		console.error("[API] Failed to get all products:", error);
		return []; // Return empty array for backward compatibility
	}
}

/**
 * Get all products with enhanced error handling (new API)
 */
export async function getAllProductsWithResponse(options?: {
	limit?: number;
	page?: number;
}): Promise<ApiResponse<ApiProduct[]>> {
	const limit =
		options?.limit && options.limit > 0
			? Math.min(options.limit, 100)
			: LIMITS.PRODUCTS_PER_PAGE;
	const page = options?.page && options.page > 0 ? options.page : 1;

	const params = new URLSearchParams();
	params.append("limit", limit.toString());
	params.append("page", page.toString());

	const endpoint = `/products?${params.toString()}`;

	try {
		const data = await apiClient<{ products: ApiProduct[] }>(endpoint);
		const products = Array.isArray(data.products) ? data.products : [];
		return createApiResponse(products);
	} catch (error) {
		const apiError = {
			message:
				error instanceof ApiClientError
					? error.message
					: "Failed to fetch products",
			status: error instanceof ApiClientError ? error.status : undefined,
			endpoint,
			timestamp: new Date().toISOString(),
		};
		return createApiResponse<ApiProduct[]>([], apiError);
	}
}

/**
 * Search products by query
 */
export async function searchProducts(query: string): Promise<ApiProduct[]> {
	const encodedQuery = encodeURIComponent(query);
	try {
		const data = await apiClient<{ products: ApiProduct[] }>(
			`/products/search?q=${encodedQuery}`,
		);
		const products = Array.isArray(data.products) ? data.products : [];
		return products.map((p) => ({ ...p, in_stock: true }));
	} catch (error) {
		console.warn(`[API] Failed to search products for "${query}":`, error);
		return [];
	}
}

/**
 * Get a specific product by ID
 */
export async function getProductById(id: string): Promise<ApiProduct | null> {
	try {
		const data = await apiClient<{ product: ApiProduct }>(`/products/${id}`);
		const product = data.product || null;
		return product ? { ...product, in_stock: true } : null;
	} catch (error) {
		console.warn(`[API] Failed to fetch product by ID "${id}":`, error);
		return null;
	}
}

/**
 * Get a specific product by handle
 */
export async function getProductByHandle(
	handle: string,
): Promise<ApiProduct | null> {
	try {
		const data = await apiClient<{ product: ApiProduct }>(
			`/products/${handle}`,
		);
		const product = data.product || null;
		return product ? { ...product, in_stock: true } : null;
	} catch (error) {
		console.warn(`[API] Failed to fetch product by handle "${handle}":`, error);
		return null;
	}
}

/**
 * Get products filtered by vendor
 */
export async function getProductsByVendor(
	vendor: string,
): Promise<ApiProduct[]> {
	const encodedVendor = encodeURIComponent(vendor);
	try {
		const data = await apiClient<{ products: ApiProduct[] }>(
			`/products?vendor=${encodedVendor}`,
		);
		const products = Array.isArray(data.products) ? data.products : [];
		return products.map((p) => ({ ...p, in_stock: true }));
	} catch (error) {
		console.warn(
			`[API] Failed to fetch products for vendor "${vendor}":`,
			error,
		);
		return [];
	}
}

/**
 * Get products from a collection by handle
 */
export async function getCollectionByHandle(
	handle: string,
	options?: {
		limit?: number;
		page?: number;
		fields?: string;
	},
): Promise<ApiProduct[]> {
	const params = new URLSearchParams();
	if (options?.limit) params.append("limit", options.limit.toString());
	if (options?.page) params.append("page", options.page.toString());
	if (options?.fields) params.append("fields", options.fields);

	const queryString = params.toString();
	const endpoint = `/collections/${handle}${
		queryString ? `?${queryString}` : ""
	}`;

	try {
		const data = await apiClient<{ products: ApiProduct[] }>(endpoint);
		const products = Array.isArray(data.products) ? data.products : [];
		console.log(`[API] getCollectionByHandle('${handle}') returned ${products.length} products.`);
		return products.map((p) => ({ ...p, in_stock: true }));
	} catch (error) {
		console.warn(
			`[API] Failed to fetch collection for handle "${handle}":`,
			error,
		);
		return [];
	}
}

