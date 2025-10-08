/**
 * Feed Pagination Utilities
 * @file lib/utils/xml-feeds/feed-pagination-utils.ts
 * 
 * Utilities for managing paginated merchant feeds
 */

import { ApiProduct } from "@/lib/types";

/**
 * Pagination configuration
 */
export const FEED_PAGINATION_CONFIG = {
  PRODUCTS_PER_PAGE: 5000,
  DEFAULT_CACHE_MAX_AGE: 3600, // 1 hour
  DEFAULT_CACHE_S_MAX_AGE: 7200, // 2 hours (CDN)
} as const;

/**
 * Calculate pagination metadata
 */
export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  startIndex: number;
  endIndex: number;
  productsInPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function calculatePaginationMetadata(
  totalProducts: number,
  currentPage: number,
  productsPerPage: number = FEED_PAGINATION_CONFIG.PRODUCTS_PER_PAGE
): PaginationMetadata {
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = Math.min(startIndex + productsPerPage, totalProducts);
  const productsInPage = endIndex - startIndex;

  return {
    currentPage,
    totalPages,
    totalProducts,
    startIndex,
    endIndex,
    productsInPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Validate page number
 */
export function validatePageNumber(
  page: string | number,
  totalPages: number
): { isValid: boolean; pageNumber: number; error?: string } {
  const pageNumber = typeof page === "string" ? parseInt(page, 10) : page;

  if (isNaN(pageNumber)) {
    return {
      isValid: false,
      pageNumber: 0,
      error: "Invalid page number format",
    };
  }

  if (pageNumber < 1) {
    return {
      isValid: false,
      pageNumber,
      error: "Page number must be greater than 0",
    };
  }

  if (pageNumber > totalPages) {
    return {
      isValid: false,
      pageNumber,
      error: `Page ${pageNumber} does not exist (total pages: ${totalPages})`,
    };
  }

  return { isValid: true, pageNumber };
}

/**
 * Slice products for a specific page
 */
export function getProductsForPage(
  allProducts: ApiProduct[],
  pageNumber: number,
  productsPerPage: number = FEED_PAGINATION_CONFIG.PRODUCTS_PER_PAGE
): ApiProduct[] {
  const startIndex = (pageNumber - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  return allProducts.slice(startIndex, endIndex);
}

/**
 * Generate pagination headers
 */
export function generatePaginationHeaders(
  metadata: PaginationMetadata,
  itemCount: number = 0,
  errorCount: number = 0
): Record<string, string> {
  return {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": `public, max-age=${FEED_PAGINATION_CONFIG.DEFAULT_CACHE_MAX_AGE}, s-maxage=${FEED_PAGINATION_CONFIG.DEFAULT_CACHE_S_MAX_AGE}, stale-while-revalidate=86400`,
    "X-Page": metadata.currentPage.toString(),
    "X-Total-Pages": metadata.totalPages.toString(),
    "X-Products-In-Page": metadata.productsInPage.toString(),
    "X-Total-Products": metadata.totalProducts.toString(),
    "X-Items-Generated": itemCount.toString(),
    "X-Errors": errorCount.toString(),
    "X-Has-Next-Page": metadata.hasNextPage.toString(),
    "X-Has-Previous-Page": metadata.hasPreviousPage.toString(),
  };
}

/**
 * Generate feed index headers
 */
export function generateIndexHeaders(
  totalProducts: number,
  totalPages: number
): Record<string, string> {
  return {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": `public, max-age=${FEED_PAGINATION_CONFIG.DEFAULT_CACHE_MAX_AGE}, s-maxage=${FEED_PAGINATION_CONFIG.DEFAULT_CACHE_S_MAX_AGE}`,
    "X-Total-Pages": totalPages.toString(),
    "X-Total-Products": totalProducts.toString(),
    "X-Products-Per-Page": FEED_PAGINATION_CONFIG.PRODUCTS_PER_PAGE.toString(),
  };
}

/**
 * Generate link relations for pagination (optional)
 */
export interface PaginationLinks {
  self: string;
  first: string;
  last: string;
  next?: string;
  prev?: string;
}

export function generatePaginationLinks(
  baseUrl: string,
  feedPath: string,
  metadata: PaginationMetadata
): PaginationLinks {
  const buildUrl = (page: number) =>
    `${baseUrl}/${feedPath}/pages/${page}`;

  const links: PaginationLinks = {
    self: buildUrl(metadata.currentPage),
    first: buildUrl(1),
    last: buildUrl(metadata.totalPages),
  };

  if (metadata.hasNextPage) {
    links.next = buildUrl(metadata.currentPage + 1);
  }

  if (metadata.hasPreviousPage) {
    links.prev = buildUrl(metadata.currentPage - 1);
  }

  return links;
}

/**
 * Generate XML comment with pagination info
 */
export function generatePaginationComment(
  metadata: PaginationMetadata
): string {
  return `
<!-- Pagination Information
  Current Page: ${metadata.currentPage} of ${metadata.totalPages}
  Products in Page: ${metadata.productsInPage}
  Total Products: ${metadata.totalProducts}
  Range: ${metadata.startIndex + 1}-${metadata.endIndex}
-->`;
}

/**
 * Calculate optimal page size based on product count
 */
export function calculateOptimalPageSize(totalProducts: number): {
  pageSize: number;
  totalPages: number;
  reason: string;
} {
  // For small catalogs, use single page
  if (totalProducts <= 1000) {
    return {
      pageSize: totalProducts,
      totalPages: 1,
      reason: "Small catalog, single page recommended",
    };
  }

  // For medium catalogs (1k-10k), use 2.5k per page
  if (totalProducts <= 10000) {
    const pageSize = 2500;
    return {
      pageSize,
      totalPages: Math.ceil(totalProducts / pageSize),
      reason: "Medium catalog, 2.5k products per page",
    };
  }

  // For large catalogs (10k-100k), use 5k per page
  if (totalProducts <= 100000) {
    const pageSize = 5000;
    return {
      pageSize,
      totalPages: Math.ceil(totalProducts / pageSize),
      reason: "Large catalog, 5k products per page",
    };
  }

  // For very large catalogs (100k+), use 10k per page
  const pageSize = 10000;
  return {
    pageSize,
    totalPages: Math.ceil(totalProducts / pageSize),
    reason: "Very large catalog, 10k products per page",
  };
}