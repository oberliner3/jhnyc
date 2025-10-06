import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";
import { fetchAllProducts } from "@/lib/utils/product-server-utils";
import {
  processProductVariants,
  FeedGenerationError,
  MerchantFeedItemData,
} from "@/lib/utils/merchant-feed-utils";
import {
  generateMerchantFeedXml,
  generateMerchantFeedXmlItem,
  getNamespacePrefix,
} from "@/lib/utils/feed-generator";
import { logger } from "@/lib/utils/logger";

export async function GET() {
  const feedType = "bing";
  try {
    logger.info(`Generating ${feedType} Merchant feed`);
    const products = await fetchAllProducts();
    logger.info(`Fetched ${products?.length} products for ${feedType} Merchant feed`);

    if (!products || products.length === 0) {
      logger.warn(`No products found for ${feedType} Merchant feed`);
      return new NextResponse("No products found", { status: 404 });
    }

    // Process all products and their variants
    const allItems: string[] = [];
    const allErrors: FeedGenerationError[] = [];
    const ns = getNamespacePrefix(feedType);

    for (const product of products) {
      const { items, errors } = processProductVariants(
        product,
        SITE_CONFIG.url,
        SITE_CONFIG.name,
        undefined,
        (itemData: MerchantFeedItemData) =>
          generateMerchantFeedXmlItem(itemData, ns)
      );
      allItems.push(...items);
      allErrors.push(...errors);
    }

    logger.info(`Generated ${allItems.length} items in ${feedType} Merchant feed`);
    if (allErrors.length > 0) {
      logger.warn(`${allErrors.length} errors occurred during feed generation`, {
        errors: allErrors,
      });
    }

    // Generate complete XML feed
    const xml = generateMerchantFeedXml(
      allItems,
      SITE_CONFIG.name,
      SITE_CONFIG.url,
      "Product feed for Bing Merchant Center",
      feedType
    );

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "X-Feed-Errors": allErrors.length.toString(),
      },
    });
  } catch (error) {
    logger.error(`Error generating ${feedType} Merchant feed`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(`Error generating feed: ${errorMessage}`, {
      status: 500,
    });
  }
}
