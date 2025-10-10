/**
 * Consolidated Merchant Feed System
 * @file app/api/feed/route.ts
 * 
 * Unified feed generator supporting multiple publishers via query parameters.
 * Supports: Google Merchant Center, Bing Merchant Center
 * 
 * Usage:
 * - /api/feed?publisher=google (Google Merchant feed)
 * - /api/feed?publisher=bing (Bing Merchant feed)
 * - /api/feed (defaults to Google)
 */

import { NextRequest } from "next/server";
import { fetchAllProducts } from "@/lib/api/cosmos-client";
import { FEED_PAGINATION_CONFIG } from "@/lib/utils/xml-feeds/feed-pagination-utils";
import { createFeedStream } from "@/lib/utils/xml-feeds/streaming-feed-generator";
import { logger } from "@/lib/utils/logger";

type SupportedPublisher = "google" | "bing";

const SUPPORTED_PUBLISHERS: SupportedPublisher[] = ["google", "bing"];

function validatePublisher(publisher: string | null): SupportedPublisher {
  if (!publisher) return "google"; // Default to Google
  
  const normalizedPublisher = publisher.toLowerCase() as SupportedPublisher;
  
  if (!SUPPORTED_PUBLISHERS.includes(normalizedPublisher)) {
    throw new Error(`Unsupported publisher: ${publisher}. Supported publishers: ${SUPPORTED_PUBLISHERS.join(", ")}`);
  }
  
  return normalizedPublisher;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const publisherParam = searchParams.get("publisher");
    const publisher = validatePublisher(publisherParam);
    
    logger.info(`Generating consolidated merchant feed for ${publisher}`);

    const products = await fetchAllProducts(
      FEED_PAGINATION_CONFIG.PRODUCTS_PER_PAGE,
    );

    if (!products || products.length === 0) {
      logger.warn(`No products found for ${publisher} merchant feed`);
      return new Response("No products found", { 
        status: 404,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }
      });
    }

    const stream = createFeedStream(products, {
      feedType: publisher,
      siteName: "J Huang NYC",
      siteUrl: "https://jhuangnyc.com",
      description: `J Huang NYC - Shop for handmade goods (${publisher.charAt(0).toUpperCase() + publisher.slice(1)} Merchant Feed)`,
      batchSize: FEED_PAGINATION_CONFIG.PRODUCTS_PER_PAGE,
    });

    const elapsed = Date.now() - startTime;
    logger.info(`Generated ${publisher} merchant feed stream in ${elapsed}ms`, {
      totalProducts: products.length,
      publisher,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/xml;charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=7200",
        "X-Publisher": publisher,
        "X-Total-Products": products.length.toString(),
        "X-Generation-Time-Ms": elapsed.toString(),
      },
    });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    logger.error(`Error generating consolidated merchant feed after ${elapsed}ms`, error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      `Error generating feed: ${errorMessage}`,
      {
        status: error instanceof Error && error.message.includes("Unsupported publisher") ? 400 : 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Generation-Time-Ms": elapsed.toString(),
        },
      }
    );
  }
}

export const revalidate = 3600;