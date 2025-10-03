/**
 * Centralized API Client
 * Provides a single, robust function for making API requests with support for
 * MessagePack, retries, timeouts, and consistent error handling.
 */

import { decode } from "msgpack-javascript";
import { API_CONFIG } from "@/lib/constants";
import { env } from "@/lib/env-validation";
import { ApiClientError, logError } from "@/lib/errors";
import { cache } from "@/lib/redis";
import { callExternalApi, ExternalApiError } from "@/lib/external-api-errors";

export interface ApiClientOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  context?: 'ssr' | 'client';
  cacheKey?: string;
  cacheTTL?: number;
}

/**
 * Performs an API request with built-in support for MessagePack, retries, and timeouts.
 * 
 * @param endpoint The API endpoint to call (e.g., '/products').
 * @param options Configuration for the request, extending the standard `fetch` options.
 * @returns The decoded response data.
 */
export async function apiClient<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
  const { 
    timeout = API_CONFIG.TIMEOUT,
    retries = API_CONFIG.RETRY_ATTEMPTS,
    context = typeof window === "undefined" ? "ssr" : "client",
    cacheKey,
    cacheTTL = 300, // 5 minutes default
    ...fetchOptions 
  } = options;

  // Check cache first (only for SSR)
  if (context === 'ssr' && cacheKey) {
    const cached = await cache.get<T>(cacheKey);
    if (cached) {
      console.log(`📋 Cache hit for ${endpoint}`);
      return cached;
    }
  }

  const isSSR = context === 'ssr';
  let url = endpoint;

  const headers = new Headers(API_CONFIG.HEADERS);
  headers.set('Accept', 'application/x-msgpack, application/json;q=0.9');

  if (options.headers) {
    const customHeaders = new Headers(options.headers);
    customHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  // For SSR, construct the full external URL and add the API key
  if (isSSR) {
    const { PRODUCT_STREAM_API, PRODUCT_STREAM_X_KEY } = env;
    if (!PRODUCT_STREAM_API || !PRODUCT_STREAM_X_KEY) {
      throw new ApiClientError(
        "API configuration missing: PRODUCT_STREAM_API or PRODUCT_STREAM_X_KEY not configured",
        500,
        "Configuration Error",
        endpoint,
      );
    }
    const base = PRODUCT_STREAM_API.replace(/\/$/, "");
    url = `${base}/cosmos${endpoint}`;
    headers.set('X-API-KEY', PRODUCT_STREAM_X_KEY);
  } else {
    // For client-side, use the relative API path
    url = endpoint.startsWith("/api/") ? endpoint : `/api${endpoint}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error = new Error("API request failed after all retries.");

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      let data: T;
      
      if (isSSR) {
        // Use enhanced external API call for SSR
        data = await callExternalApi<T>(url, {
          ...fetchOptions,
          headers,
        }, 'external-api');
      } else {
        // Use standard fetch for client-side
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new ApiClientError(
            `API request failed: ${errorBody}`,
            response.status,
            response.statusText,
            endpoint,
          );
        }

        const contentType = response.headers.get("Content-Type");
        
        if (contentType?.includes("application/x-msgpack")) {
          const arrayBuffer = await response.arrayBuffer();
          data = decode(arrayBuffer) as T;
        } else {
          data = await response.json();
        }
      }

      clearTimeout(timeoutId);

      // Cache successful responses (only for SSR)
      if (context === 'ssr' && cacheKey) {
        await cache.set(cacheKey, data, cacheTTL);
        console.log(`💾 Cached response for ${endpoint}`);
      }

      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown API error");

      if (error instanceof ExternalApiError) {
        if (!error.retryable) {
          break; // Don't retry on non-retryable errors
        }
      } else if (error instanceof ApiClientError && error.status) {
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
          break; // Don't retry on client-side errors (except 429)
        }
      }

      if (attempt < retries) {
        const delay = API_CONFIG.RETRY_DELAY * 2 ** (attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  clearTimeout(timeoutId);

  logError(lastError, {
    endpoint,
    url,
    attempts: retries,
  });

  throw lastError;
}
