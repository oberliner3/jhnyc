/**
 * Paginated Bing Merchant Feed Route
 * @file app/api/feed/bing-merchant/pages/[page]/route.ts
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

export async function GET(
  request: NextRequest,
  { params }: { params: { page: string } }
) {
  const page = parseInt(params.page, 10);
  const feedType = "bing";

  if (isNaN(page) || page < 1) {
    return new NextResponse("Invalid page number", { status: 400 });
  }

  try {
    logger.info(`Generating Bing Merchant feed page ${page}`);

    // Fetch all products
    const allProducts = await fetchAllProducts();
    
    if (!allProducts || allProducts.length === 0) {
      logger.warn("No products found for Bing Merchant feed");
      return new NextResponse("No products found", { status: 404 });
    }

    // Calculate pagination
    const totalProducts = allProducts.length;
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
    const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
    const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);

    // Check if page exists
    if (page > totalPages) {
      return new NextResponse("Page not found", { status: 404 });
    }

    // Get products for this page
    const pageProducts = allProducts.slice(startIndex, endIndex);
    logger.info(
      `Processing ${pageProducts.length} products (${startIndex + 1}-${endIndex} of ${totalProducts})`
    );

    // Generate feed items
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

    // Generate XML
    const xml = generateMerchantFeedXml(
      allItems,
      SITE_CONFIG.name,
      SITE_CONFIG.url,
      `Product feed for Bing Merchant Center - Page ${page} of ${totalPages}`,
      feedType
    );

    logger.info(
      `Generated Bing Merchant feed page ${page} with ${allItems.length} items (${errorCount} errors)`
    );

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=7200",
        "X-Page": page.toString(),
        "X-Total-Pages": totalPages.toString(),
        "X-Products-In-Page": pageProducts.length.toString(),
        "X-Total-Products": totalProducts.toString(),
        "X-Items-Generated": allItems.length.toString(),
        "X-Errors": errorCount.toString(),
      },
    });
  } catch (error) {
    logger.error(`Error generating Bing Merchant feed page ${page}`, error);
    return new NextResponse(
      `Error generating feed: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}