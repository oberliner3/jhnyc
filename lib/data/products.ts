import { API_CONFIG } from "@/lib/constants";
import type { ApiProduct } from "@/lib/types";

interface GetProductsOptions {
  limit: number;
  page: number;
  search?: string;
  context?: 'ssr' | 'client';
}

export async function getProducts({ limit, page, search, context }: GetProductsOptions): Promise<ApiProduct[]> {
  // This is a placeholder function. In a real application, you would fetch data from an external API.
  // For now, it returns an empty array.
  console.log(`[getProducts] Fetching products with limit=${limit}, page=${page}, search=${search || 'none'}, context=${context}`);

  // Simulate API call
  const url = new URL(`${API_CONFIG.PRODUCT_STREAM_API}/products`);
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('page', page.toString());
  if (search) {
    url.searchParams.set('search', search);
  }

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    return data.products || [];
  } catch (_error) {
    console.error("Error fetching products:", _error);
    return [];
  }
}

interface GetProductByHandleOptions {
  context?: 'ssr' | 'client';
}

export async function getProductByHandle(handle: string, { context }: GetProductByHandleOptions): Promise<ApiProduct | null> {
  console.log(`[getProductByHandle] Fetching product with handle=${handle}, context=${context}`);

  const url = new URL(`${API_CONFIG.PRODUCT_STREAM_API}/products/handle/${handle}`);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Product not found
      }
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    return data.product || null;
  } catch (error) {
    console.error("Error fetching product by handle:", error);
    return null;
  }
}

interface GetProductByIdOptions {
  context?: 'ssr' | 'client';
}

export async function getProductById(id: string, { context }: GetProductByIdOptions): Promise<ApiProduct | null> {
  console.log(`[getProductById] Fetching product with id=${id}, context=${context}`);

  const url = new URL(`${API_CONFIG.PRODUCT_STREAM_API}/products/${id}`);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Product not found
      }
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    return data.product || null;
  } catch (_error) {
    return null;
  }
}

interface SearchProductsOptions {
  limit: number;
  page: number;
  context?: 'ssr' | 'client';
}

export async function searchProducts(query: string, { limit, page, context }: SearchProductsOptions): Promise<ApiProduct[]> {
  console.log(`[searchProducts] Searching for products with query=${query}, limit=${limit}, page=${page}, context=${context}`);

  const url = new URL(`${API_CONFIG.PRODUCT_STREAM_API}/products/search`);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('page', page.toString());

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    return [];
  }
}

interface GetCollectionByHandleOptions {
  limit: number;
  page: number;
  fields?: string;
  context?: 'ssr' | 'client';
}

export async function getCollectionByHandle(handle: string, { limit, page, fields, context }: GetCollectionByHandleOptions): Promise<ApiProduct[]> {
  console.log(`[getCollectionByHandle] Fetching collection with handle=${handle}, limit=${limit}, page=${page}, context=${context}`);

  const url = new URL(`${API_CONFIG.PRODUCT_STREAM_API}/collections/${handle}`);
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('page', page.toString());
  if (fields) {
    url.searchParams.set('fields', fields);
  }

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching collection by handle:", error);
    return [];
  }
}