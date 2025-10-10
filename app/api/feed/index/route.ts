/**
 * Consolidated Feed Index Route
 * @file app/api/feed/index/route.ts
 * 
 * Generates sitemap index for paginated feeds with publisher support.
 * 
 * Usage:
 * - /api/feed/index?publisher=google (Google Merchant feed index)
 * - /api/feed/index?publisher=bing (Bing Merchant feed index)
 * - /api/feed/index (defaults to Google)
 */

import { NextRequest, NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";
import { fetchAllProducts } from "@/lib/utils/product-server-utils";
import { generateFeedIndexXml } from "@/lib/utils/xml-feeds";
import {
  generateIndexHeaders,
  FEED_PAGINATION_CONFIG,
} from "@/lib/utils/xml-feeds/feed-pagination-utils";
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

    logger.info(`Generating consolidated feed index for ${publisher}`);

    const allProducts = await fetchAllProducts(
      FEED_PAGINATION_CONFIG.PRODUCTS_PER_PAGE
    );

    if (!allProducts || allProducts.length === 0) {
      logger.warn(`No products found for ${publisher} feed index`);
      return new NextResponse("No products found", { 
        status: 404,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }
      });
    }

    const totalProducts = allProducts.length;
    const totalPages = Math.ceil(
      totalProducts / FEED_PAGINATION_CONFIG.PRODUCTS_PER_PAGE
    );

    logger.info(`Generating ${publisher} feed index`, {
      totalProducts,
      totalPages,
      productsPerPage: FEED_PAGINATION_CONFIG.PRODUCTS_PER_PAGE,
    });

    const xml = generateFeedIndexXml(
      SITE_CONFIG.url,
      `api/feed/pages?publisher=${publisher}`,
      totalPages
    );

    const elapsed = Date.now() - startTime;
    logger.info(`Generated ${publisher} feed index in ${elapsed}ms`, {
      totalPages,
      totalProducts,
      publisher,
    });

    const headers = generateIndexHeaders(totalProducts, totalPages);
    headers["X-Generation-Time-Ms"] = elapsed.toString();
    headers["X-Publisher"] = publisher;

    return new NextResponse(xml, { headers });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    logger.error(
      `Error generating consolidated feed index after ${elapsed}ms`,
      error
    );

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new NextResponse(
      `Error generating feed index: ${errorMessage}`,
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