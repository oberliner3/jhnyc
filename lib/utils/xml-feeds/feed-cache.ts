/**
 * Feed Caching Strategy
 * @file lib/utils/xml-feeds/feed-cache.ts
 * 
 * Intelligent caching for large feeds:
 * - Redis/Vercel KV for feed storage
 * - Incremental updates
 * - Cache warming
 */

import { cache } from "@/lib/redis";
import { ApiProduct } from "@/lib/types";
import { logger } from "@/lib/utils/logger";

export interface FeedCacheConfig {
  ttl: number; // Time to live in seconds
  warmupSchedule?: string; // Cron schedule for cache warming
  incrementalUpdates: boolean;
}

export interface CachedFeed {
  xml: string;
  metadata: {
    generatedAt: number;
    productCount: number;
    variantCount: number;
    errorCount: number;
    generationTimeMs: number;
  };
}

const DEFAULT_CONFIG: FeedCacheConfig = {
  ttl: 3600, // 1 hour
  incrementalUpdates: true,
};

/**
 * Generate cache key for feed
 */
export function generateFeedCacheKey(
  feedType: string,
  options?: {
    filtered?: boolean;
    prioritized?: boolean;
  }
): string {
  const parts = ["merchant-feed", feedType];
  
  if (options?.filtered) parts.push("filtered");
  if (options?.prioritized) parts.push("prioritized");
  
  return parts.join(":");
}

/**
 * Get cached feed if available and valid
 */
export async function getCachedFeed(
  cacheKey: string
): Promise<CachedFeed | null> {
  try {
    const cached = await cache.get<CachedFeed>(cacheKey);
    
    if (!cached) {
      logger.debug("Feed cache miss", { cacheKey });
      return null;
    }

    logger.info("Feed cache hit", {
      cacheKey,
      age: Date.now() - cached.metadata.generatedAt,
      productCount: cached.metadata.productCount,
    });

    return cached;
  } catch (error) {
    logger.error("Error retrieving cached feed", error);
    return null;
  }
}

/**
 * Store feed in cache
 */
export async function storeFeedInCache(
  cacheKey: string,
  feed: CachedFeed,
  ttl: number = DEFAULT_CONFIG.ttl
): Promise<void> {
  try {
    await cache.set(cacheKey, feed, ttl);
    
    logger.info("Feed stored in cache", {
      cacheKey,
      ttl,
      sizeKB: Math.round(feed.xml.length / 1024),
      productCount: feed.metadata.productCount,
    });
  } catch (error) {
    logger.error("Error storing feed in cache", error);
  }
}

/**
 * Invalidate feed cache
 */
export async function invalidateFeedCache(feedType: string): Promise<void> {
  try {
    const patterns = [
      generateFeedCacheKey(feedType),
      generateFeedCacheKey(feedType, { filtered: true }),
      generateFeedCacheKey(feedType, { prioritized: true }),
      generateFeedCacheKey(feedType, { filtered: true, prioritized: true }),
    ];

    for (const pattern of patterns) {
      await cache.del(pattern);
    }

    logger.info("Feed cache invalidated", { feedType, patterns });
  } catch (error) {
    logger.error("Error invalidating feed cache", error);
  }
}

/**
 * Check if products have been updated since cache generation
 */
export async function shouldRegenerateFeed(
  cacheKey: string,
  currentProducts: ApiProduct[]
): Promise<boolean> {
  const cached = await getCachedFeed(cacheKey);
  
  if (!cached) return true;

  // Check if product count changed significantly (>1%)
  const countDiff = Math.abs(
    currentProducts.length - cached.metadata.productCount
  );
  const threshold = cached.metadata.productCount * 0.01;
  
  if (countDiff > threshold) {
    logger.info("Significant product count change detected", {
      cached: cached.metadata.productCount,
      current: currentProducts.length,
      diff: countDiff,
    });
    return true;
  }

  // Check cache age
  const age = Date.now() - cached.metadata.generatedAt;
  const maxAge = DEFAULT_CONFIG.ttl * 1000;
  
  if (age > maxAge) {
    logger.info("Cache expired", { age, maxAge });
    return true;
  }

  return false;
}

/**
 * Get feed from cache or generate new one
 */
export async function getOrGenerateFeed(
  feedType: string,
  options: {
    filtered?: boolean;
    prioritized?: boolean;
  },
  generateFn: () => Promise<CachedFeed>
): Promise<CachedFeed> {
  const cacheKey = generateFeedCacheKey(feedType, options);
  
  // Try to get from cache first
  const cached = await getCachedFeed(cacheKey);
  if (cached) {
    return cached;
  }

  // Generate new feed
  logger.info("Generating new feed", { feedType, options });
  const feed = await generateFn();
  
  // Store in cache
  await storeFeedInCache(cacheKey, feed);
  
  return feed;
}

/**
 * Incremental feed update
 * Only regenerate items for products that changed
 */
export interface IncrementalUpdateConfig {
  changedProductIds: (string | number)[];
  fullFeed: string;
  products: ApiProduct[];
}

export async function performIncrementalUpdate(
  config: IncrementalUpdateConfig
): Promise<string> {
  // This is a placeholder for incremental update logic
  // In practice, you would:
  // 1. Parse the existing XML
  // 2. Find and replace items for changed products
  // 3. Return updated XML
  
  logger.info("Performing incremental feed update", {
    changedCount: config.changedProductIds.length,
    totalProducts: config.products.length,
  });

  // For now, return full feed
  // Implement XML parsing and selective update as needed
  return config.fullFeed;
}

/**
 * Cache warming function
 * Pre-generate feeds during off-peak hours
 */
export async function warmFeedCache(
  feedTypes: string[],
  generateFn: (feedType: string) => Promise<CachedFeed>
): Promise<void> {
  logger.info("Starting feed cache warming", { feedTypes });
  
  const startTime = Date.now();
  const results: Record<string, { success: boolean; timeMs: number }> = {};

  for (const feedType of feedTypes) {
    const typeStartTime = Date.now();
    
    try {
      const feed = await generateFn(feedType);
      const cacheKey = generateFeedCacheKey(feedType);
      await storeFeedInCache(cacheKey, feed);
      
      results[feedType] = {
        success: true,
        timeMs: Date.now() - typeStartTime,
      };
    } catch (error) {
      logger.error(`Error warming cache for ${feedType}`, error);
      results[feedType] = {
        success: false,
        timeMs: Date.now() - typeStartTime,
      };
    }
  }

  const totalTime = Date.now() - startTime;
  logger.info("Feed cache warming complete", { results, totalTime });
}