/**
 * API client for Cosmos API integration
 * Base URL: http://localhost:8000
 */
import type { Product, ProductImage, ProductOption, ProductVariant } from './types';

// Types specific to the API response structure
export interface ApiProduct {
  id: string;
  title: string;
  handle: string;
  body_html: string;
  price: number;
  compare_at_price?: number;
  images: ApiProductImage[];
  category: string;
  in_stock: boolean;
  rating: number;
  review_count: number;
  tags: string[];
  vendor: string;
  variants: ApiProductVariant[];
  options: ApiProductOption[];
  created_at: string;
  updated_at: string;
}

export interface ApiProductImage {
  id: string;
  product_id: string;
  position: number;
  alt?: string;
  src: string;
  width?: number;
  height?: number;
  created_at: string;
  updated_at: string;
  variant_ids?: string[];
}

export interface ApiProductVariant {
  id: string;
  product_id: string;
  title: string;
  option1?: string;
  option2?: string;
  option3?: string;
  sku?: string;
  requires_shipping: boolean;
  taxable: boolean;
  featured_image?: string;
  available: boolean;
  price: number;
  grams: number;
  compare_at_price?: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ApiProductOption {
  id: string;
  product_id: string;
  name: string;
  position: number;
  values: string[];
}


async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint;
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
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
}): Promise<Product[]> {
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
    return Array.isArray(data.products) ? data.products.map(mapApiToProduct) : [];
  } catch (error) {
    console.warn(`[API] Failed to fetch products from ${endpoint}:`, error);
    return [];
  }
}

/**
 * Search products by query
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const encodedQuery = encodeURIComponent(query);
  try {
    const data = await apiRequest<{ products: ApiProduct[] }>(`/api/products?search=${encodedQuery}`);
    return Array.isArray(data.products) ? data.products.map(mapApiToProduct) : [];
  } catch (error) {
    console.warn(`[API] Failed to search products for "${query}":`, error);
    return [];
  }
}

/**
 * Get a specific product by ID
 */
export async function getProductById(id: string): Promise<Product> {
  const data = await apiRequest<ApiProduct>(`/api/products/${id}`);
  return mapApiToProduct(data);
}

/**
 * Get a specific product by handle
 */
export async function getProductByHandle(handle: string): Promise<Product> {
  const data = await apiRequest<ApiProduct>(`/api/products/${handle}`);
  return mapApiToProduct(data);
}

/**
 * Get products filtered by vendor
 */
export async function getProductsByVendor(vendor: string): Promise<Product[]> {
  const encodedVendor = encodeURIComponent(vendor);
  try {
    const data = await apiRequest<{ products: ApiProduct[] }>(`/api/products?vendor=${encodedVendor}`);
    return Array.isArray(data.products) ? data.products.map(mapApiToProduct) : [];
  } catch (error) {
    console.warn(`[API] Failed to fetch products for vendor "${vendor}":`, error);
    return [];
  }
}

/**
 * Get image proxy URL
 */
export function getImageProxyUrl(imageUrl: string): string {
  const encodedUrl = encodeURIComponent(imageUrl);
  return `https://moritotabi.com/cosmos/image-proxy?url=${encodedUrl}`;
}

/**
 * Helper function to transform API product to internal Product type
 */
export function mapApiToProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    title: apiProduct.title,
    handle: apiProduct.handle,
    body_html: apiProduct.body_html,
    price: apiProduct.price,
    compareAtPrice: apiProduct.compare_at_price,
    images: apiProduct.images as ProductImage[],
    category: apiProduct.category,
    inStock: apiProduct.in_stock,
    rating: apiProduct.rating,
    reviewCount: apiProduct.review_count,
    tags: apiProduct.tags,
    vendor: apiProduct.vendor,
    variants: apiProduct.variants.map((variant: ApiProductVariant): ProductVariant => ({
      id: variant.id,
      name: variant.title,
      price: typeof variant.price === 'string' ? parseFloat(variant.price) : variant.price,
      inStock: variant.available,
      image: variant.featured_image,
    })),
    options: apiProduct.options.map((option: ApiProductOption): ProductOption => ({
      id: typeof option.id === 'string' ? parseInt(option.id, 10) : option.id,
      name: option.name,
      position: option.position,
      values: option.values,
    })),
  };
}
