/**
 * Advanced Google Feed Route with Progress Monitoring
 * @file app/api/feed/google/advanced/route.ts
 * 
 * Enhanced version with:
 * - Real-time progress tracking
 * - Memory monitoring
 * - Product filtering
 * - Detailed statistics
 */

import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";
import { fetchAllProducts } from "@/lib/utils/product-server-utils";
import {
  createFeedStream,
  generateFeedHeader,
  generateFeedFooter,
  processBatch,
} from "@/lib/utils/xml-feeds/streaming-feed-generator";
import {
  filterFeedEligibleProducts,
  calculateFeedStats,
  getMemoryUsage,
  FeedProgress,
  prioritizeProducts,
} from "@/lib/utils/xml-feeds/feed-optimization-utils";
import { logger } from "@/lib/utils/logger";
import { getNamespacePrefix } from "@/lib/utils/xml-feeds/feed-generator";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max for Vercel Pro
export const revalidate = 3600;

export async function GET(request: Request) {
  const feedType = "google";
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  
  // Optional filters
  const filterEnabled = searchParams.get("filter") !== "false";
  const batchSize = parseInt(searchParams.get("batchSize") || "100", 10);
  const prioritize = searchParams.get("prioritize") === "true";
  
  try {
    logger.info(
      `Starting advanced ${feedType} feed generation`,
      { filterEnabled, batchSize, prioritize }
    );
    
    // Fetch all products
    const allProducts = await fetchAllProducts();
    logger.info(`Fetched ${allProducts?.length || 0} products from API`);

    if (!allProducts || allProducts.length === 0) {
      return new NextResponse("No products found", { status: 404 });
    }

    // Filter eligible products
    let products = filterEnabled
      ? filterFeedEligibleProducts(allProducts)
      : allProducts;
    
    logger.info(
      `Filtered to ${products.length} eligible products`,
      {
        skipped: allProducts.length - products.length,
        filterEnabled,
      }
    );

    // Prioritize if requested
    if (prioritize) {
      products = prioritizeProducts(products);
      logger.info("Products prioritized by variants and update date");
    }

    // Create streaming response with progress tracking
    const encoder = new TextEncoder();
    const ns = getNamespacePrefix(feedType);
    let totalErrors = 0;
    let processedCount = 0;
    const progress = new FeedProgress(products.length, 10000); // Log every 10s

    const stream = new ReadableStream({
      async start(controller) {
        // Send header
        controller.enqueue(
          encoder.encode(
            generateFeedHeader({
              feedType,
              siteName: SITE_CONFIG.name,
              siteUrl: SITE_CONFIG.url,
              description: "Product feed for Google Merchant Center",
            })
          )
        );

        // Log initial memory
        const initialMem = getMemoryUsage();
        logger.info("Initial memory usage", initialMem);
      },

      async pull(controller) {
        if (processedCount >= products.length) {
          // Send footer
          controller.enqueue(encoder.encode(generateFeedFooter()));

          // Calculate and log final statistics
          const stats = calculateFeedStats(
            allProducts,
            products,
            totalErrors,
            startTime
          );

          logger.info("Feed generation complete", {
            ...stats,
            memoryUsage: getMemoryUsage(),
          });

          // Add stats as XML comment
          const statsComment = `
<!-- Feed Statistics
  Total Products: ${stats.totalProducts}
  Eligible Products: ${stats.eligibleProducts}
  Total Variants: ${stats.totalVariants}
  Skipped Products: ${stats.skippedProducts}
  Errors: ${stats.totalErrors}
  Processing Time: ${(stats.processingTimeMs / 1000).toFixed(2)}s
  Avg Time/Product: ${stats.averageTimePerProduct.toFixed(2)}ms
-->`;
          controller.enqueue(encoder.encode(statsComment));

          controller.close();
          return;
        }

        // Process batch
        const batch = products.slice(
          processedCount,
          processedCount + batchSize
        );
        const { xml, errorCount } = processBatch(batch, {
          feedType,
          siteName: SITE_CONFIG.name,
          siteUrl: SITE_CONFIG.url,
          description: "Product feed for Google Merchant Center",
          batchSize,
        });

        totalErrors += errorCount;
        processedCount += batch.length;
        progress.increment(batch.length);

        // Log progress periodically
        if (progress.shouldLog()) {
          const progressData = progress.getProgress();
          logger.info("Feed generation progress", {
            ...progressData,
            errors: totalErrors,
            memoryUsage: getMemoryUsage(),
          });
        }

        controller.enqueue(encoder.encode(xml));
      },

      cancel() {
        logger.warn("Feed generation cancelled by client", {
          processed: processedCount,
          total: products.length,
        });
      },
    });

    // Return streaming response with enhanced headers
    return new Response(stream, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control":
          "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400",
        "X-Product-Count": products.length.toString(),
        "X-Total-Products": allProducts.length.toString(),
        "X-Feed-Type": feedType,
        "X-Batch-Size": batchSize.toString(),
        "X-Filter-Enabled": filterEnabled.toString(),
        "X-Prioritized": prioritize.toString(),
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    logger.error(
      `Error generating ${feedType} feed after ${elapsed}ms`,
      error
    );

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