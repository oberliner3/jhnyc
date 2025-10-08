/**
 * Feed Optimization Utilities
 * @file lib/utils/xml-feeds/feed-optimization-utils.ts
 * 
 * Additional optimization utilities for large-scale feed generation
 */

import { ApiProduct } from "@/lib/types";

/**
 * Batch iterator for processing large arrays
 * Memory-efficient iteration over large product arrays
 */
export function* batchIterator<T>(
  items: T[],
  batchSize: number
): Generator<T[], void, unknown> {
  for (let i = 0; i < items.length; i += batchSize) {
    yield items.slice(i, i + batchSize);
  }
}

/**
 * Parallel batch processor
 * Process multiple batches concurrently with controlled concurrency
 */
export async function processBatchesInParallel<T, R>(
  items: T[],
  batchSize: number,
  maxConcurrent: number,
  processFn: (batch: T[]) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const batches: T[][] = [];
  
  // Create batches
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  // Process batches with controlled concurrency
  for (let i = 0; i < batches.length; i += maxConcurrent) {
    const batchGroup = batches.slice(i, i + maxConcurrent);
    const groupResults = await Promise.all(
      batchGroup.map((batch) => processFn(batch))
    );
    results.push(...groupResults);
  }

  return results;
}

/**
 * Filter products for feed eligibility
 * Remove products that shouldn't be in the feed
 */
export function filterFeedEligibleProducts(
  products: ApiProduct[]
): ApiProduct[] {
  return products.filter((product) => {
    // Skip products without variants
    if (!product.variants || product.variants.length === 0) {
      return false;
    }

    // Skip products with hidden/internal tags
    const excludeTags = ["hidden", "internal", "draft", "test"];
    if (
      product.tags?.some((tag) =>
        excludeTags.includes(tag.toLowerCase().trim())
      )
    ) {
      return false;
    }

    // Skip products without images
    if (!product.images || product.images.length === 0) {
      return false;
    }

    return true;
  });
}

/**
 * Product feed statistics
 */
export interface FeedStatistics {
  totalProducts: number;
  totalVariants: number;
  eligibleProducts: number;
  skippedProducts: number;
  totalErrors: number;
  processingTimeMs: number;
  averageTimePerProduct: number;
}

/**
 * Calculate feed statistics
 */
export function calculateFeedStats(
  allProducts: ApiProduct[],
  eligibleProducts: ApiProduct[],
  errorCount: number,
  startTime: number
): FeedStatistics {
  const processingTimeMs = Date.now() - startTime;
  const totalVariants = eligibleProducts.reduce(
    (sum, p) => sum + (p.variants?.length || 0),
    0
  );

  return {
    totalProducts: allProducts.length,
    totalVariants,
    eligibleProducts: eligibleProducts.length,
    skippedProducts: allProducts.length - eligibleProducts.length,
    totalErrors: errorCount,
    processingTimeMs,
    averageTimePerProduct:
      eligibleProducts.length > 0
        ? processingTimeMs / eligibleProducts.length
        : 0,
  };
}

/**
 * Memory usage tracker (for monitoring)
 */
export function getMemoryUsage(): {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
} {
  if (typeof process !== "undefined" && process.memoryUsage) {
    const mem = process.memoryUsage();
    return {
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      external: Math.round(mem.external / 1024 / 1024),
      rss: Math.round(mem.rss / 1024 / 1024),
    };
  }
  return { heapUsed: 0, heapTotal: 0, external: 0, rss: 0 };
}

/**
 * Progress tracker for streaming
 */
export class FeedProgress {
  private processed = 0;
  private total: number;
  private startTime: number;
  private lastLogTime: number;
  private logInterval: number;

  constructor(total: number, logIntervalMs: number = 5000) {
    this.total = total;
    this.startTime = Date.now();
    this.lastLogTime = this.startTime;
    this.logInterval = logIntervalMs;
  }

  increment(count: number = 1): void {
    this.processed += count;
  }

  shouldLog(): boolean {
    const now = Date.now();
    if (now - this.lastLogTime >= this.logInterval) {
      this.lastLogTime = now;
      return true;
    }
    return false;
  }

  getProgress(): {
    processed: number;
    total: number;
    percentage: number;
    elapsedMs: number;
    estimatedTotalMs: number;
    estimatedRemainingMs: number;
  } {
    const elapsedMs = Date.now() - this.startTime;
    const percentage = (this.processed / this.total) * 100;
    const estimatedTotalMs = (elapsedMs / this.processed) * this.total;
    const estimatedRemainingMs = estimatedTotalMs - elapsedMs;

    return {
      processed: this.processed,
      total: this.total,
      percentage: Math.round(percentage * 100) / 100,
      elapsedMs,
      estimatedTotalMs: Math.round(estimatedTotalMs),
      estimatedRemainingMs: Math.round(estimatedRemainingMs),
    };
  }

  reset(): void {
    this.processed = 0;
    this.startTime = Date.now();
    this.lastLogTime = this.startTime;
  }
}

/**
 * Chunk products by category for better cache locality
 */
export function chunkProductsByCategory(
  products: ApiProduct[]
): Map<string, ApiProduct[]> {
  const chunks = new Map<string, ApiProduct[]>();

  for (const product of products) {
    const category = product.product_type || "uncategorized";
    const existing = chunks.get(category) || [];
    existing.push(product);
    chunks.set(category, existing);
  }

  return chunks;
}

/**
 * Prioritize products for feed generation
 * Process high-priority products first
 */
export function prioritizeProducts(products: ApiProduct[]): ApiProduct[] {
  return [...products].sort((a, b) => {
    // Priority 1: Products with more variants
    const variantDiff = (b.variants?.length || 0) - (a.variants?.length || 0);
    if (variantDiff !== 0) return variantDiff;

    // Priority 2: Products updated more recently
    const dateA = new Date(a.updated_at || 0).getTime();
    const dateB = new Date(b.updated_at || 0).getTime();
    return dateB - dateA;
  });
}