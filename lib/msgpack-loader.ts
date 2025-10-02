/**
 * Advanced MessagePack data loader for Next.js
 * Supports both SSR and client-side data loading with automatic optimization
 */

import { decode } from "msgpack-javascript";
import { env } from "./env-validation";
import { ApiClientError, logError } from "./errors";
import { API_CONFIG } from "./constants";
import type { ApiProduct } from "./types";

// Performance metrics tracking
interface LoadingMetrics {
  startTime: number;
  endTime?: number;
  format: 'json' | 'msgpack';
  size: number;
  compressionRatio?: number;
  error?: string;
}

const metrics: LoadingMetrics[] = [];

/**
 * Client capability detection - determines if client supports MessagePack
 */
export function detectMessagePackSupport(): boolean {
  if (typeof window === "undefined") {
    // Server-side - always support MessagePack
    return true;
  }
  
  // Client-side detection
  try {
    // Check if we can use MessagePack (basic capability test)
    const testData = { test: "data" };
    const testArray = new Uint8Array([0x81, 0xa4, 0x74, 0x65, 0x73, 0x74, 0xa4, 0x64, 0x61, 0x74, 0x61]);
    const decoded = decode(testArray) as unknown;
    
    // Store support in sessionStorage for performance
    sessionStorage.setItem("msgpack_support", "true");
    return JSON.stringify(decoded) === JSON.stringify(testData);
  } catch {
    sessionStorage.setItem("msgpack_support", "false");
    return false;
  }
}

/**
 * Enhanced data loader with automatic format selection
 */
export async function loadDataOptimized<T>(
  endpoint: string,
  options: {
    forceFormat?: 'json' | 'msgpack';
    timeout?: number;
    retries?: number;
    context?: 'ssr' | 'client';
  } = {}
): Promise<T> {
  const {
    forceFormat,
    timeout = API_CONFIG.TIMEOUT,
    retries = API_CONFIG.RETRY_ATTEMPTS,
    context = typeof window === "undefined" ? "ssr" : "client",
  } = options;
  
  const metric: LoadingMetrics = {
    startTime: performance.now(),
    format: 'json', // default
    size: 0,
  };
  
  const isSSR = context === "ssr";
  const supportsMessagePack = forceFormat === 'msgpack' || 
    (forceFormat !== 'json' && (isSSR || detectMessagePackSupport()));
  
  try {
    // Resolve environment (only on server-side)
    const baseUrl = isSSR
      ? (env.PRODUCT_STREAM_API ?? "").replace(/\/$/, "")
      : "";
    
    const url = isSSR 
      ? `${baseUrl}/cosmos${endpoint}`
      : endpoint.startsWith("/api/") ? endpoint : `/api${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const headers: Record<string, string> = {
          ...API_CONFIG.HEADERS,
        };
        
        // Add API key for direct external calls (SSR only)
        if (isSSR) {
          const apiKey = env.PRODUCT_STREAM_X_KEY;
          if (apiKey) {
            headers["X-API-KEY"] = apiKey;
          }
        }
        
        // Request MessagePack if supported
        if (supportsMessagePack) {
          headers["Accept"] = "application/x-msgpack, application/json;q=0.9";
          metric.format = 'msgpack';
        } else {
          headers["Accept"] = "application/json";
        }
        
        const response = await fetch(url, {
          headers,
          signal: controller.signal,
        });

        console.log("supportsMessagePack", supportsMessagePack);
        console.log("Content-Type", response.headers.get("Content-Type"));
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new ApiClientError(
            `Request failed: ${response.statusText}`,
            response.status,
            response.statusText,
            endpoint
          );
        }
        
        const contentType = response.headers.get("Content-Type");
        let data: T;
        
        if (contentType?.includes("application/x-msgpack")) {
          const arrayBuffer = await response.arrayBuffer();
          if (!arrayBuffer) {
            throw new Error("Failed to get array buffer from response");
          }
          metric.size = arrayBuffer.byteLength;
          metric.format = 'msgpack';
          
          const uint8Array = new Uint8Array(arrayBuffer);
          data = decode(uint8Array) as T;
          
          // Calculate compression ratio if we have the original size hint
          const originalSize = response.headers.get("X-Original-Size");
          if (originalSize) {
            metric.compressionRatio = parseInt(originalSize) / metric.size;
          }
          
          console.log(`📦 Loaded data via MessagePack: ${metric.size}B${
            metric.compressionRatio ? ` (${metric.compressionRatio.toFixed(2)}x compression)` : ""
          }`);
        } else {
          const jsonText = await response.text();
          metric.size = new TextEncoder().encode(jsonText).length;
          metric.format = 'json';
          data = JSON.parse(jsonText);
          
          console.log(`📄 Loaded data via JSON: ${metric.size}B`);
        }
        
        metric.endTime = performance.now();
        metrics.push(metric);
        
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");
        
        // Don't retry client errors except rate limits
        if (error instanceof ApiClientError) {
          if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
            break;
          }
        }
        
        // Exponential backoff for retries
        if (attempt < retries) {
          const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    clearTimeout(timeoutId);
    throw lastError || new Error("All retry attempts failed");
    
  } catch (error) {
    metric.endTime = performance.now();
    metric.error = error instanceof Error ? error.message : "Unknown error";
    metrics.push(metric);
    
    logError(error instanceof Error ? error : new Error("Unknown error"), {
      endpoint,
      context,
      supportsMessagePack,
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
  options: { forceMessagePack?: boolean } = {}
): Promise<T> {
  return loadDataOptimized<T>(endpoint, {
    context: 'ssr',
    forceFormat: options.forceMessagePack ? 'msgpack' : undefined,
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

/**
 * Get loading performance metrics
 */
export function getLoadingMetrics(): {
  total: number;
  messagePackUsage: number;
  averageSize: { json: number; msgpack: number };
  averageTime: { json: number; msgpack: number };
  averageCompression: number;
} {
  const jsonMetrics = metrics.filter(m => m.format === 'json' && !m.error);
  const msgpackMetrics = metrics.filter(m => m.format === 'msgpack' && !m.error);
  
  const avgJsonSize = jsonMetrics.length > 0 
    ? jsonMetrics.reduce((sum, m) => sum + m.size, 0) / jsonMetrics.length
    : 0;
  
  const avgMsgpackSize = msgpackMetrics.length > 0 
    ? msgpackMetrics.reduce((sum, m) => sum + m.size, 0) / msgpackMetrics.length
    : 0;
  
  const avgJsonTime = jsonMetrics.length > 0 
    ? jsonMetrics.reduce((sum, m) => sum + ((m.endTime || m.startTime) - m.startTime), 0) / jsonMetrics.length
    : 0;
  
  const avgMsgpackTime = msgpackMetrics.length > 0 
    ? msgpackMetrics.reduce((sum, m) => sum + ((m.endTime || m.startTime) - m.startTime), 0) / msgpackMetrics.length
    : 0;
  
  const avgCompression = msgpackMetrics
    .filter(m => m.compressionRatio)
    .reduce((sum, m, _, arr) => sum + (m.compressionRatio! / arr.length), 0);
  
  return {
    total: metrics.length,
    messagePackUsage: msgpackMetrics.length / Math.max(metrics.length, 1),
    averageSize: { json: avgJsonSize, msgpack: avgMsgpackSize },
    averageTime: { json: avgJsonTime, msgpack: avgMsgpackTime },
    averageCompression: avgCompression,
  };
}

/**
 * Clear performance metrics
 */
export function clearMetrics(): void {
  metrics.length = 0;
}

/**
 * Preload data with MessagePack optimization
 */
export function preloadData<T>(endpoint: string): Promise<T> {
  // Use requestIdleCallback if available, otherwise setTimeout
  return new Promise((resolve, reject) => {
    const loadFn = () => {
      loadDataForClient<T>(endpoint, { cache: true })
        .then(resolve)
        .catch(reject);
    };
    
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      requestIdleCallback(loadFn);
    } else {
      setTimeout(loadFn, 0);
    }
  });
}