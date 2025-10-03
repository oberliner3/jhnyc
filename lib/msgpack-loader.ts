/**
 * Advanced MessagePack data loader for Next.js
 * Supports both SSR and client-side data loading with automatic optimization
 */

import { logError } from "./errors";
import type { ApiProduct } from "./types";
import { apiClient } from "@/lib/utils/api-client";

/**
 * Enhanced data loader with automatic format selection
 */
export async function loadDataOptimized<T>(
  endpoint: string,
  options: {
    timeout?: number;
    retries?: number;
    context?: 'ssr' | 'client';
  } = {}
): Promise<T> {
  try {
    return await apiClient<T>(endpoint, options);
  } catch (error) {
    logError(error instanceof Error ? error : new Error("Unknown error"), {
      endpoint,
      context: options.context || (typeof window === "undefined" ? "ssr" : "client"),
    });
    throw error;
  }
}

/**
 * Specialized product loader with MessagePack optimization
 */
export async function loadProducts(
  options: {
    limit?: number;
    page?: number;
    search?: string;
    context?: 'ssr' | 'client';
  } = {}
): Promise<ApiProduct[]> {
  const { limit = 20, page = 1, search, context } = options;
  
  const params = new URLSearchParams();
  params.set("limit", limit.toString());
  params.set("page", page.toString());
  if (search) {
    params.set("q", search);
  }
  
  const endpoint = search 
    ? `/products/search?${params.toString()}`
    : `/products?${params.toString()}`;
  
  try {
    const response = await loadDataOptimized<{ products: ApiProduct[] }>(endpoint, { context });
    const products = Array.isArray(response.products) ? response.products : [];
    
    // Force all products to in_stock: true (as per your existing logic)
    return products.map(p => ({ ...p, in_stock: true }));
  } catch (error) {
    console.warn(`Failed to load products:`, error);
    return [];
  }
}

/**
 * Load single product with MessagePack optimization
 */
export async function loadProduct(
  id: string,
  options: { context?: 'ssr' | 'client' } = {}
): Promise<ApiProduct | null> {
  try {
    const response = await loadDataOptimized<{ product: ApiProduct }>(`/products/${id}`, options);
    const product = response.product || null;
    return product ? { ...product, in_stock: true } : null;
  } catch (error) {
    console.warn(`Failed to load product ${id}:`, error);
    return null;
  }
}

/**
 * Load product by handle with MessagePack optimization
 */
export async function loadProductByHandle(
  handle: string,
  options: { context?: 'ssr' | 'client' } = {}
): Promise<ApiProduct | null> {
  try {
    const response = await loadDataOptimized<{ product: ApiProduct }>(`/products/by-handle/${handle}`, options);
    const product = response.product || null;
    return product ? { ...product, in_stock: true } : null;
  } catch (error) {
    console.warn(`Failed to load product by handle ${handle}:`, error);
    return null;
  }
}

/**
 * SSR-specific data loader for getServerSideProps
 */
export async function loadDataForSSR<T>(
  endpoint: string,
): Promise<T> {
  return loadDataOptimized<T>(endpoint, {
    context: 'ssr',
  });
}

/**
 * Client-specific data loader with caching
 */
export async function loadDataForClient<T>(
  endpoint: string,
  options: {
    cache?: boolean;
    cacheTTL?: number;
    forceRefresh?: boolean;
  } = {}
): Promise<T> {
  const { cache = true, cacheTTL = 60000, forceRefresh = false } = options; // 1 minute default cache
  
  const cacheKey = `msgpack_cache_${endpoint}`;
  
  if (cache && !forceRefresh && typeof window !== "undefined") {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached !== null) {
        const { data, timestamp } = JSON.parse(cached) as { data: T; timestamp: number };
        if (data !== undefined && timestamp !== undefined && Date.now() - timestamp < cacheTTL) {
          console.log(`📋 Using cached data for ${endpoint}`);
          return data as T;
        }
      }
    } catch {
      // Ignore cache errors
    }
  }
  
  const data = await loadDataOptimized<T>(endpoint, { context: 'client' });
  
  if (cache && typeof window !== "undefined") {
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch {
      // Ignore storage errors (quota exceeded, etc.)
    }
  }
  
  return data;
}