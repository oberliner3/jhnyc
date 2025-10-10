/**
 * Consolidated Paginated Feed Route
 * @file app/api/feed/pages/[page]/route.ts
 * 
 * Provides paginated access to merchant feeds with publisher support.
 * 
 * Usage:
 * - /api/feed/pages/1?publisher=google (Google Merchant feed, page 1)
 * - /api/feed/pages/2?publisher=bing (Bing Merchant feed, page 2)
 * - /api/feed/pages/1 (defaults to Google, page 1)
 */

import { NextRequest } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";
import { fetchAllProducts } from "@/lib/utils/product-server-utils";
import {
  processProductVariants,
  generateMerchantFeedXml,
  generateMerchantFeedXmlItem,
  getNamespacePrefix,
  MerchantFeedItemData,
} from "@/lib/utils/xml-feeds";
import { logger } from "@/lib/utils/logger";
import {
  calculatePaginationMetadata,
  getProductsForPage,
  generatePaginationHeaders,
  FEED_PAGINATION_CONFIG,
} from "@/lib/utils/xml-feeds/feed-pagination-utils";

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

type Context = {
  params: Promise<{ page: string }>;
};

export async function GET(request: NextRequest, context: Context) {
  const startTime = Date.now();
  
  try {
    const { page } = await context.params;
    const pageNumber = parseInt(page, 10);
    
    const { searchParams } = new URL(request.url);
    const publisherParam = searchParams.get("publisher");
    const publisher = validatePublisher(publisherParam);

    if (isNaN(pageNumber) || pageNumber < 1) {
      return new Response("Invalid page number", { status: 400 });
    }

    logger.info(`Generating ${publisher} merchant feed page ${pageNumber}`);

    const allProducts = await fetchAllProducts();
    if (!allProducts || allProducts.length === 0) {
      logger.warn(`No products found for ${publisher} merchant feed page ${pageNumber}`);
      return new Response("No products found", { 
        status: 404,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }
      });
    }

    const metadata = calculatePaginationMetadata(
      allProducts.length,
      pageNumber,
      FEED_PAGINATION_CONFIG.PRODUCTS_PER_PAGE
    );

    if (pageNumber > metadata.totalPages) {
      return new Response("Page not found", { 
        status: 404,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }
      });
    }

    const pageProducts = getProductsForPage(
      allProducts,
      pageNumber,
      FEED_PAGINATION_CONFIG.PRODUCTS_PER_PAGE
    );

    const allItems: string[] = [];
    const ns = getNamespacePrefix(publisher);
    let errorCount = 0;

    for (const product of pageProducts) {
      const { items, errors } = processProductVariants(
        product,
        SITE_CONFIG.url,
        SITE_CONFIG.name,
        undefined,
        (itemData: MerchantFeedItemData) =>
          generateMerchantFeedXmlItem(itemData, ns)
      );
      allItems.push(...items);
      errorCount += errors.length;
    }

    const xml = generateMerchantFeedXml(
      allItems,
      SITE_CONFIG.name,
      SITE_CONFIG.url,
      `Product feed for ${publisher.charAt(0).toUpperCase() + publisher.slice(1)} Merchant Center - Page ${pageNumber} of ${metadata.totalPages}`,
      publisher
    );

    const elapsed = Date.now() - startTime;
    logger.info(`Generated ${publisher} merchant feed page ${pageNumber} in ${elapsed}ms`, {
      totalPages: metadata.totalPages,
      totalProducts: metadata.totalProducts,
      productsInPage: pageProducts.length,
      itemsGenerated: allItems.length,
      errorCount,
      publisher,
    });

    const headers = generatePaginationHeaders(metadata, allItems.length, errorCount);
    headers["X-Generation-Time-Ms"] = elapsed.toString();
    headers["X-Publisher"] = publisher;

    return new Response(xml, { headers });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    logger.error(`Error generating consolidated paginated feed after ${elapsed}ms`, error);

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