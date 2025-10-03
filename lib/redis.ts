import { Redis } from '@upstash/redis';

// Initialize Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache utilities with error handling
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data as T;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  async set<T>(key: string, value: T, ttl: number = 300): Promise<void> {
    try {
      await redis.setex(key, ttl, value);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  },

  async keys(pattern: string): Promise<string[]> {
    try {
      return await redis.keys(pattern);
    } catch (error) {
      console.error('Redis keys error:', error);
      return [];
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  },

  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error('Redis ttl error:', error);
      return -1;
    }
  }
};

// Cache invalidation utilities
export const invalidateCache = {
  // Invalidate product-related caches
  async products(): Promise<void> {
    try {
      const keys = await redis.keys('products:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`🗑️ Invalidated ${keys.length} product cache entries`);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  },

  // Invalidate specific product
  async product(productId: string): Promise<void> {
    try {
      const keys = await redis.keys(`products:*${productId}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Product cache invalidation error:', error);
    }
  },

  // Invalidate collection caches
  async collections(): Promise<void> {
    try {
      const keys = await redis.keys('collections:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`🗑️ Invalidated ${keys.length} collection cache entries`);
      }
    } catch (error) {
      console.error('Collection cache invalidation error:', error);
    }
  },

  // Clear all caches (admin function)
  async all(): Promise<void> {
    try {
      await redis.flushdb();
      console.log('🗑️ Cleared all cache entries');
    } catch (error) {
      console.error('Full cache clear error:', error);
    }
  }
};

// Cache key generators
export const cacheKeys = {
  products: (limit: number, page: number, search?: string) => 
    `products:${limit}:${page}:${search || 'all'}`,
  
  product: (id: string) => `product:${id}`,
  
  productByHandle: (handle: string) => `product:handle:${handle}`,
  
  collections: (limit: number, page: number) => 
    `collections:${limit}:${page}`,
  
  collection: (slug: string) => `collection:${slug}`,
  
  search: (query: string, limit: number, page: number) => 
    `search:${query}:${limit}:${page}`,
};

// Cache statistics
export const getCacheStats = async () => {
  try {
    const keys = await redis.keys('*');
    const stats = {
      totalKeys: keys.length,
      productKeys: keys.filter(k => k.startsWith('products:')).length,
      collectionKeys: keys.filter(k => k.startsWith('collections:')).length,
      searchKeys: keys.filter(k => k.startsWith('search:')).length,
    };
    
    return stats;
  } catch (error) {
    console.error('Cache stats error:', error);
    return {
      totalKeys: 0,
      productKeys: 0,
      collectionKeys: 0,
      searchKeys: 0,
    };
  }
};