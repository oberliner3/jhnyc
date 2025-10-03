/**
 * Centralized API Client
 * Provides a single, robust function for making API requests with support for
 * MessagePack, retries, timeouts, and consistent error handling.
 */

import { decode } from "msgpack-javascript";
import { API_CONFIG } from "@/lib/constants";
import { env } from "@/lib/env-validation";
import { ApiClientError, logError } from "@/lib/errors";

export interface ApiClientOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  context?: 'ssr' | 'client';
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
    ...fetchOptions 
  } = options;

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
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
        return decode(arrayBuffer) as T;
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown API error");

      if (error instanceof ApiClientError && error.status) {
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
