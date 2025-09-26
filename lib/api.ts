/**
 * API client for Cosmos API integration
 * Base URL: http://localhost:8000
 */

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
  price: string;
  grams: number;
  compare_at_price?: string;
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
  return fetch(url, options).then(res => res.json());
}
  return fetch(url, options).then(res => res.json());
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
  const data = await apiRequest<ApiProduct>(`/api/products/handle/${handle}`);
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
export function transformApiProduct(apiProduct: ApiProduct): ApiProduct {
  return {
    ...apiProduct,
    // Ensure consistent field naming
    compare_at_price: apiProduct.compare_at_price,
    in_stock: apiProduct.in_stock,
    review_count: apiProduct.review_count,
  };
}
