// ===================================
// BING MERCHANT FEED INDEX
// Create as: app/api/feed/bing-merchant/index/route.ts
// ===================================

import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";
import { fetchAllProducts } from "@/lib/utils/product-server-utils";
import { generateFeedIndexXml } from "@/lib/utils/xml-feeds";
import {
  calculatePaginationMetadata,
  generateIndexHeaders,
  FEED_PAGINATION_CONFIG,
} from "@/lib/utils/xml-feeds/feed-pagination-utils";
import { logger } from "@/lib/utils/logger";



export async function GET() {
  const startTime = Date.now();

  try {
    logger.info("Generating Bing Merchant feed index");

    const allProducts = await fetchAllProducts();

    if (!allProducts || allProducts.length === 0) {
      logger.warn("No products found for feed index");
      return new NextResponse("No products found", { status: 404 });
    }

    const totalProducts = allProducts.length;
    const totalPages = Math.ceil(
      totalProducts / FEED_PAGINATION_CONFIG.PRODUCTS_PER_PAGE
    );

    logger.info("Generating feed index", {
      totalProducts,
      totalPages,
      productsPerPage: FEED_PAGINATION_CONFIG.PRODUCTS_PER_PAGE,
    });

    const xml = generateFeedIndexXml(
      SITE_CONFIG.url,
      "api/feed/bing-merchant",
      totalPages
    );

    const elapsed = Date.now() - startTime;
    logger.info(`Generated Bing Merchant feed index in ${elapsed}ms`, {
      totalPages,
      totalProducts,
    });

    const headers = generateIndexHeaders(totalProducts, totalPages);
    headers["X-Generation-Time-Ms"] = elapsed.toString();

    return new NextResponse(xml, { headers });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    logger.error(
      `Error generating Bing Merchant feed index after ${elapsed}ms`,
      error
    );

    return new NextResponse(
      `Error generating feed index: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}


export const revalidate = 3600;
export const dynamic = "force-dynamic";
export const runtime = "edge";