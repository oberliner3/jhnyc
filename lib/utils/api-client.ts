/**
 * Centralized API Client
 * Provides a single, robust function for making API requests with support for
 * MessagePack, retries, timeouts, and consistent error handling.
 */

import { API_CONFIG } from "@/lib/constants";
import { env } from "@/lib/env-validation";
import { ApiClientError, logError } from "@/lib/errors";
import { cache } from "@/lib/redis";
import { callExternalApi, ExternalApiError } from "@/lib/external-api-errors";

export interface ApiClientOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  context?: "ssr" | "client";
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
export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const {
    timeout = API_CONFIG.TIMEOUT,
    retries = API_CONFIG.RETRY_ATTEMPTS,
    context = typeof window === "undefined" ? "ssr" : "client",
    cacheKey,
    cacheTTL = 300,
    ...fetchOptions
  } = options;

  const isServer = context === "ssr";
  const headers = new Headers({
    Accept: "application/json",
    ...API_CONFIG.HEADERS,
  });

  if (options.headers) {
    const customHeaders = new Headers(options.headers);
    customHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  let lastError: Error = new Error("API request failed.");

  const buildUrl = () => {
    const base = env.NEXT_PUBLIC_COSMOS_API_BASE_URL?.replace(/\/$/, "") ?? "";
    const normalised = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const path = normalised.startsWith("/cosmos")
      ? normalised
      : `/cosmos${normalised}`;

    return isServer ? `${base}${path}` : `/api${path}`;
  };

  const performRequest = async () => {
    const requestUrl = buildUrl();

    if (isServer) {
      applyServerHeaders(headers);

      if (cacheKey) {
        const cached = await cache.get<T>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const data = await fetchFromExternal<T>(
        requestUrl,
        fetchOptions,
        headers
      );

      if (cacheKey) {
        await cache.set(cacheKey, data, cacheTTL);
      }

      return data;
    }

    return fetchFromInternal<T>(
      requestUrl,
      fetchOptions,
      headers,
      controller.signal
    );
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const data = await performRequest();
      clearTimeout(timeoutId);
      return data;
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Unknown API error");
    }
  }

  clearTimeout(timeoutId);
  logError(lastError, { endpoint, attempts: retries, url: buildUrl() });
  throw lastError;
}

function applyServerHeaders(headers: Headers) {
  const { COSMOS_API_KEY } = env;

  if (!COSMOS_API_KEY) {
    throw new ApiClientError(
      "API configuration missing: COSMOS_API_KEY not configured",
      500,
      "Configuration Error",
      "external-api"
    );
  }

  headers.set("X-API-Key", COSMOS_API_KEY);
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
}

async function fetchFromExternal<T>(
  url: string,
  options: RequestInit,
  headers: Headers
): Promise<T> {
  try {
    const data = await callExternalApi<T>(
      url,
      {
        ...options,
        headers,
      },
      "external-api"
    );

    return data;
  } catch (error) {
    if (error instanceof ExternalApiError) {
      throw error;
    }

    throw new ApiClientError(
      error instanceof Error ? error.message : "External API error",
      500,
      "External API Error",
      url
    );
  }
}

async function fetchFromInternal<T>(
  url: string,
  options: RequestInit,
  headers: Headers,
  signal: AbortSignal
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers,
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new ApiClientError(
      `API request failed: ${errorBody}`,
      response.status,
      response.statusText,
      url
    );
  }

  const contentType = response.headers.get("Content-Type") || "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  return text as T;
}
