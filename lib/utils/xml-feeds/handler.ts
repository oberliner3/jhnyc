import { NextRequest, NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";
import { getProducts } from "@/lib/data/products";
import {
  processProductVariants,
  generateMerchantFeedXml,
  generateMerchantFeedXmlItem,
  getNamespacePrefix,
  MerchantFeedItemData,
  MerchantFeedType,
} from "@/lib/utils/xml-feeds";
import { logger } from "@/lib/utils/logger";

const PRODUCTS_PER_PAGE = 5000;

export async function generatePaginatedFeed(
  req: NextRequest,
  params: { page: string },
  feedType: MerchantFeedType
) {
  const page = parseInt(params.page, 10);

  if (isNaN(page) || page < 1) {
    return new NextResponse("Invalid page number", { status: 400 });
  }

  try {
    logger.info(`Generating ${feedType} Merchant feed page ${page}`);

    const products = await getProducts({
      limit: PRODUCTS_PER_PAGE,
      page: page,
      context: "ssr",
    });

    if (!products || products.length === 0) {
      logger.warn(`No products found for ${feedType} Merchant feed page ${page}`);
      const emptyXml = generateMerchantFeedXml(
        [],
        SITE_CONFIG.name,
        SITE_CONFIG.url,
        `Product feed for ${feedType} Merchant Center - Page ${page}`,
        feedType
      );
      return new NextResponse(emptyXml, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    }

    const allItems: string[] = [];
    const ns = getNamespacePrefix(feedType);

    for (const product of products) {
      const { items } = processProductVariants(
        product,
        SITE_CONFIG.url,
        SITE_CONFIG.name,
        undefined,
        (itemData: MerchantFeedItemData) =>
          generateMerchantFeedXmlItem(itemData, ns)
      );
      allItems.push(...items);
    }

    const xml = generateMerchantFeedXml(
      allItems,
      SITE_CONFIG.name,
      SITE_CONFIG.url,
      `Product feed for ${feedType} Merchant Center - Page ${page}`,
      feedType
    );

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    logger.error(`Error generating ${feedType} Merchant feed page ${page}`, error);
    return new NextResponse("Error generating feed page", { status: 500 });
  }
}
