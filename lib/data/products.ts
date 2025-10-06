import type { ApiProduct } from "@/lib/types";
import { logger } from "@/lib/utils/logger";
import * as cosmosClient from "@/lib/api/cosmos-client";

export interface GetProductsOptions {
  limit: number;
  page: number;
  search?: string;
  context?: "ssr" | "client";
}

/**
 * Get products with optional search
 * Wrapper around COSMOS API client for backward compatibility
 */
export async function getProducts({
  limit,
  page,
  search,
  context,
}: GetProductsOptions): Promise<ApiProduct[]> {
  logger.debug("Fetching products", {
    limit,
    page,
    search: search || "none",
    context,
  });

  try {
    let response;
    if (search) {
      response = await cosmosClient.searchProducts(
        search,
        { limit, page },
        {
          cache: context === "ssr" ? "force-cache" : "default",
          revalidate: 300,
        }
      );
    } else {
      response = await cosmosClient.getProducts(
        { limit, page },
        { cache: context === "ssr" ? "force-cache" : "default", revalidate: 300 }
      );
    }
    return (response.products || []).map((p: ApiProduct) => ({ ...p, in_stock: true }));
  } catch (error) {
    logger.error("Error fetching products", error);
    return [];
  }
}

export interface GetProductByHandleOptions {
  context?: "ssr" | "client";
}

/**
 * Get product by handle
 */
export async function getProductByHandle(
  handle: string,
  { context = "ssr" }: GetProductByHandleOptions
): Promise<ApiProduct | null> {
  logger.debug("Fetching product by handle", { handle, context });

  try {
    const response = await cosmosClient.getProduct(handle, {
      cache: context === "ssr" ? "force-cache" : "default",
      revalidate: 300,
    });
    if (!response.product) {
      return null;
    }
    return {
      ...response.product,
      in_stock: true,
    };
  } catch (error) {
    logger.error("Error fetching product by handle", error, { handle });
    return null;
  }
}

interface GetProductByIdOptions {
  context?: "ssr" | "client";
}

/**
 * Get product by ID
 */
export async function getProductById(
  id: string,
  { context }: GetProductByIdOptions
): Promise<ApiProduct | null> {
  logger.debug("Fetching product by ID", { id, context });

  try {
    const response = await cosmosClient.getProduct(id, {
      cache: context === "ssr" ? "force-cache" : "default",
      revalidate: 300,
    });
    if (!response.product) {
      return null;
    }
    return {
      ...response.product,
      in_stock: true,
    };
  } catch (error) {
    logger.error("Error fetching product by ID", error, { id });
    return null;
  }
}

interface SearchProductsOptions {
  limit: number;
  page: number;
  context?: "ssr" | "client";
}

/**
 * Search for products
 */
export async function searchProducts(
  query: string,
  { limit, page, context }: SearchProductsOptions
): Promise<ApiProduct[]> {
  logger.debug("Searching products", { query, limit, page, context });

  try {
    const response = await cosmosClient.searchProducts(
      query,
      { limit, page },
      { cache: context === "ssr" ? "force-cache" : "default", revalidate: 180 }
    );
    return (response.products || []).map((p: ApiProduct) => ({ ...p, in_stock: true }));
  } catch (error) {
    logger.error("Error searching products", error, { query });
    return [];
  }
}

interface GetCollectionByHandleOptions {
  limit: number;
  page: number;
  fields?: string;
  context?: "ssr" | "client";
}

/**
 * Get products from a collection
 */
export async function getCollectionByHandle(
  handle: string,
  { limit, page, fields, context }: GetCollectionByHandleOptions
): Promise<ApiProduct[]> {
  logger.debug("Fetching collection by handle", {
    handle,
    limit,
    page,
    fields,
    context,
  });

  try {
    const response = await cosmosClient.getCollection(
      handle,
      { limit, page, fields },
      { cache: context === "ssr" ? "force-cache" : "default", revalidate: 600 }
    );
    return (response.products || []).map((p: ApiProduct) => ({ ...p, in_stock: true }));
  } catch (error) {
    logger.error("Error fetching collection by handle", error, { handle });
    return [];
  }
}
