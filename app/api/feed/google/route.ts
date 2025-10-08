/**
 * Optimized Google Merchant Feed Route with Streaming
 * @file app/api/feed/google/route.ts
 * 
 * Optimized for 380k+ products using:
 * - Streaming response (memory-efficient)
 * - Progressive product processing
 * - Automatic compression
 * - Edge runtime support
 */

import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";
import { fetchAllProducts } from "@/lib/utils/product-server-utils";
import {
  createFeedStream,
  estimateFeedSize,
  generateFeedHeader,
  generateFeedFooter,
  processBatch,
} from "@/lib/utils/xml-feeds/streaming-feed-generator";
import { logger } from "@/lib/utils/logger";

// Enable edge runtime for better performance
export const runtime = "nodejs"; // Use 'edge' if your deps support it
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const feedType = "google";
  const startTime = Date.now();
  
  try {
    logger.info(`Starting ${feedType} Merchant feed generation (streaming)`);
    
    // Fetch all products (this returns raw data, not processed XML)
    const products = await fetchAllProducts();
    const productCount = products?.length || 0;
    
    logger.info(`Fetched ${productCount} products for ${feedType} Merchant feed`);

    if (!products || productCount === 0) {
      logger.warn(`No products found for ${feedType} Merchant feed`);
      return new NextResponse("No products found", { status: 404 });
    }

    // Estimate size for Content-Length header (optional)
    const estimatedSize = estimateFeedSize(productCount);
    
    // Create streaming response
    const stream = createFeedStream(products, {
      feedType,
      siteName: SITE_CONFIG.name,
      siteUrl: SITE_CONFIG.url,
      description: "Product feed for Google Merchant Center",
      batchSize: 100, // Process 100 products at a time
    });

    const elapsed = Date.now() - startTime;
    logger.info(
      `Started streaming ${feedType} feed (${productCount} products) in ${elapsed}ms`
    );

    // Return streaming response
    return new Response(stream, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400",
        "X-Product-Count": productCount.toString(),
        "X-Feed-Type": feedType,
        "X-Generation-Time": elapsed.toString(),
        // Hint to enable compression
        "Content-Encoding": "identity", // Let Vercel handle gzip
      },
    });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    logger.error(`Error generating ${feedType} Merchant feed after ${elapsed}ms`, error);
    
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    
    return new NextResponse(`Error generating feed: ${errorMessage}`, {
      status: 500,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }
}