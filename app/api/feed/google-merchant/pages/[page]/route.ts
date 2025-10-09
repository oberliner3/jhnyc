/**
 * Paginated Google Merchant Feed Route
 * @file app/api/feed/google-merchant/pages/[page]/route.ts
 *
 * Provides paginated access to all products in chunks
 */

import { NextRequest, NextResponse } from "next/server";
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

// Products per page (adjust based on your needs)
const PRODUCTS_PER_PAGE = 5000;
type Context = {
  params: Promise<{ page: string }>;
};
export async function GET(
  request: NextRequest,
  context: Context
) {
  const { page } = await context.params;
  const pageNumber = parseInt(page, 10);
  const feedType = "google";

  if (isNaN(pageNumber) || pageNumber < 1) {
    return new Response("Invalid page number", { status: 400 });
  }

  try {
    logger.info(`Generating Google Merchant feed page ${pageNumber}`);

    const allProducts = await fetchAllProducts();
    if (!allProducts || allProducts.length === 0) {
      return new Response("No products found", { status: 404 });
    }

    const totalProducts = allProducts.length;
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
    if (pageNumber > totalPages) {
      return new Response("Page not found", { status: 404 });
    }

    const startIndex = (pageNumber - 1) * PRODUCTS_PER_PAGE;
    const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);
    const pageProducts = allProducts.slice(startIndex, endIndex);

    const allItems: string[] = [];
    const ns = getNamespacePrefix(feedType);
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
      `Product feed for Google Merchant Center - Page ${pageNumber} of ${totalPages}`,
      feedType
    );

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=7200",
        "X-Page": String(pageNumber),
        "X-Total-Pages": String(totalPages),
        "X-Products-In-Page": String(pageProducts.length),
        "X-Total-Products": String(totalProducts),
        "X-Items-Generated": String(allItems.length),
        "X-Errors": String(errorCount),
      },
    });
  } catch (error) {
    logger.error("Feed generation error", error);
    return new Response(
      `Error generating feed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      { status: 500 }
    );
  }
}
export const revalidate = 3600; // optional ISR
export const dynamic = "force-dynamic"; // ensure live data
export const runtime = "edge"; // uncomment for edge runtime
