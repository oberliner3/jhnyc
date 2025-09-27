/**
 * API client for Cosmos API integration
 * Base URL: http://localhost:8000
 */

import { SITE_CONFIG } from "./constants";
import {
  ApiProduct,
  ApiProductImage,
  ApiProductVariant,
  ApiProductOption,
} from "./types";



async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint;
  const response = await fetch(url, options);
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
  fields?: string;
}): Promise<ApiProduct[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.page) params.append("page", options.page.toString());
  if (options?.fields) params.append("fields", options.fields);

  const queryString = params.toString();
  const endpoint = queryString
    ? `/api/products?${queryString}`
    : "/api/products";

  try {
    const data = await apiRequest<{ products: ApiProduct[] }>(endpoint);
    return Array.isArray(data.products)
      ? data.products.map(mapApiToProduct)
      : [];
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
      `/api/products?search=${encodedQuery}`
    );
    return Array.isArray(data.products)
      ? data.products.map(mapApiToProduct)
      : [];
  } catch (error) {
    console.warn(`[API] Failed to search products for "${query}":`, error);
    return [];
  }
}

/**
 * Get a specific product by ID
 */
export async function getProductById(id: string): Promise<ApiProduct> {
  const data = await apiRequest<ApiProduct>(`/api/products/${id}`);
  return mapApiToProduct(data);
}

/**
 * Get a specific product by handle
 */
export async function getProductByHandle(handle: string): Promise<ApiProduct> {
  const data = await apiRequest<ApiProduct>(`/api/products/${handle}`);
  return mapApiToProduct(data);
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
      `/api/products?vendor=${encodedVendor}`
    );
    return Array.isArray(data.products)
      ? data.products.map(mapApiToProduct)
      : [];
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

/**
 * Helper function to transform API product to internal Product type
 */
export function mapApiToProduct(apiProduct: ApiProduct): ApiProduct {
  return {
    id: apiProduct.id,
    title: apiProduct.title,
    handle: apiProduct.handle,
    body_html: apiProduct.body_html,
    price: apiProduct.price,
    compare_at_price: apiProduct.compare_at_price,
    images: apiProduct.images as ApiProductImage[],
    category: apiProduct.category,
    in_stock: apiProduct.in_stock,
    rating: apiProduct.rating,
    review_count: apiProduct.review_count,
    tags: apiProduct.tags,
    vendor: apiProduct.vendor,
    variants: apiProduct.variants.map(
      (variant: ApiProductVariant): ApiProductVariant => ({
        id: variant.id,
        title: variant.title,
        price: variant.price,
        available: variant.available,
        featured_image: variant.featured_image,
        product_id: variant.product_id,
        requires_shipping: variant.requires_shipping,
        taxable: variant.taxable,
        grams: variant.grams,
        position: variant.position,
        created_at: variant.created_at,
        updated_at: variant.updated_at,
      })
    ),
    options: apiProduct.options.map(
      (option: ApiProductOption): ApiProductOption => ({
        name: option.name,
        position: option.position,
        values: option.values,
        product_id: option.product_id,
        id: option.id,
      })
    ),

    created_at: apiProduct.created_at,
    updated_at: apiProduct.updated_at,
  };
}
