/**
 * MessagePack-enhanced checkout utilities
 * Provides efficient data transfer for checkout operations
 */

import { encodeShopifyData, decodeShopifyData } from "./msgpack-shopify";
import type { CheckoutData } from "@/app/(checkout)/checkout/actions";

/**
 * Enhanced fetch function that automatically uses MessagePack when beneficial
 */
export async function msgpackFetch<T = unknown>(
  url: string, 
  options: RequestInit & { data?: unknown } = {}
): Promise<T> {
  const { data, ...fetchOptions } = options;
  
  // Prepare headers
  const headers = new Headers(fetchOptions.headers);
  
  // If we have data to send, determine the best format
  if (data && (fetchOptions.method === "POST" || fetchOptions.method === "PUT" || fetchOptions.method === "PATCH")) {
    const jsonSize = new TextEncoder().encode(JSON.stringify(data)).length;
    
    // Use MessagePack for larger payloads or complex objects
    if (jsonSize > 1024 || shouldUseMessagePack(data)) {
      const encodedData = encodeShopifyData(data);
      
      fetchOptions.body = Buffer.from(encodedData);
      headers.set("Content-Type", "application/x-msgpack");
      
      console.log(`🚀 Using MessagePack for request - Payload: ${jsonSize}B → ${encodedData.length}B`);
    } else {
      fetchOptions.body = JSON.stringify(data);
      headers.set("Content-Type", "application/json");
    }
  }
  
  // Request MessagePack response when beneficial
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/x-msgpack, application/json");
  }
  
  fetchOptions.headers = headers;
  
  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  
  const contentType = response.headers.get("Content-Type");
  
  if (contentType?.includes("application/x-msgpack")) {
    const arrayBuffer = await response.arrayBuffer();
    const decoded = decodeShopifyData<T>(new Uint8Array(arrayBuffer));
    
    const compressionRatio = response.headers.get("X-Compression-Ratio");
    const compressionSavings = response.headers.get("X-Compression-Savings");
    
    if (compressionRatio && compressionSavings) {
      console.log(`📦 Received MessagePack response - Compression: ${compressionSavings} (ratio: ${compressionRatio}x)`);
    }
    
    return decoded;
  }
  
  return await response.json();
}

/**
 * Optimized checkout submission using MessagePack
 */
export async function submitCheckoutWithMessagePack(checkoutData: CheckoutData): Promise<{
  success: boolean;
  orderId?: string;
  error?: string;
  message?: string;
}> {
  try {
    return await msgpackFetch("/api/checkout", {
      method: "POST",
      data: checkoutData,
    });
  } catch (error) {
    console.error("MessagePack checkout submission failed:", error);
    throw error;
  }
}

/**
 * Optimized draft order creation using MessagePack
 */
export async function createDraftOrderWithMessagePack(orderData: unknown): Promise<unknown> {
  try {
    return await msgpackFetch("/api/draft-orders", {
      method: "POST",
      data: orderData,
    });
  } catch (error) {
    console.error("MessagePack draft order creation failed:", error);
    throw error;
  }
}

/**
 * Determine if MessagePack should be used based on data characteristics
 */
function shouldUseMessagePack(data: unknown): boolean {
  // Use MessagePack for:
  // 1. Objects with deep nesting (e.g., checkout data with customer + items + totals)
  // 2. Arrays with many items
  // 3. Objects with many properties
  // 4. Data containing repetitive string patterns
  
  if (typeof data !== "object" || data === null) {
    return false;
  }
  
  const jsonString = JSON.stringify(data);
  const size = jsonString.length;
  
  // Always use MessagePack for larger payloads
  if (size > 2048) {
    return true;
  }
  
  // Check for complex structures that benefit from binary serialization
  const depth = getObjectDepth(data);
  const keyCount = countAllKeys(data);
  
  return depth > 2 || keyCount > 10;
}

/**
 * Calculate object depth recursively
 */
function getObjectDepth(obj: unknown, currentDepth = 0): number {
  if (typeof obj !== "object" || obj === null) {
    return currentDepth;
  }
  
  if (Array.isArray(obj)) {
    return Math.max(...obj.map(item => getObjectDepth(item, currentDepth + 1)));
  }
  
  const depths = Object.values(obj).map(value => getObjectDepth(value, currentDepth + 1));
  return Math.max(currentDepth, ...depths);
}

/**
 * Count all keys in nested object structure
 */
function countAllKeys(obj: unknown): number {
  if (typeof obj !== "object" || obj === null) {
    return 0;
  }
  
  if (Array.isArray(obj)) {
    return obj.reduce((count, item) => count + countAllKeys(item), 0);
  }
  
  const keys = Object.keys(obj);
  const nestedKeyCount = Object.values(obj).reduce((count, value) => count + countAllKeys(value), 0);
  
  return keys.length + nestedKeyCount;
}

/**
 * Benchmark MessagePack vs JSON for given data
 */
export function benchmarkSerialization(data: unknown): {
  json: { size: number; time: number };
  msgpack: { size: number; time: number };
  winner: "json" | "msgpack";
  improvement: string;
} {
  // JSON benchmark
  const jsonStart = performance.now();
  const jsonString = JSON.stringify(data);
  const jsonSize = new TextEncoder().encode(jsonString).length;
  const jsonTime = performance.now() - jsonStart;
  
  // MessagePack benchmark
  const msgpackStart = performance.now();
  const msgpackData = encodeShopifyData(data);
  const msgpackSize = msgpackData.length;
  const msgpackTime = performance.now() - msgpackStart;
  
  const winner = msgpackSize < jsonSize ? "msgpack" : "json";
  const improvement = winner === "msgpack" 
    ? `${((1 - msgpackSize / jsonSize) * 100).toFixed(1)}% smaller`
    : `${((1 - jsonSize / msgpackSize) * 100).toFixed(1)}% smaller`;
  
  return {
    json: { size: jsonSize, time: jsonTime },
    msgpack: { size: msgpackSize, time: msgpackTime },
    winner,
    improvement,
  };
}

/**
 * Middleware for automatic MessagePack detection in server actions
 */
export function createMessagePackAction<T extends (...args: unknown[]) => unknown>(
  action: T,
  options: { forceMessagePack?: boolean } = {}
): T {
  return (async (...args: Parameters<T>) => {
    // In a real implementation, you might use a custom header or form field
    // to detect if the client supports MessagePack
    const shouldUseMsgPack = options.forceMessagePack || 
      (args.length > 0 && shouldUseMessagePack(args[0]));
    
    if (shouldUseMsgPack) {
      console.log("🔄 Using MessagePack-optimized server action");
    }
    
    return await action(...args);
  }) as T;
}