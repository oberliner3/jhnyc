import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";
import type {
  ApiProduct,
  ApiProductOption,
  ApiProductVariant,
} from "@/lib/types";
import { escapeXml } from "@/lib/utils/xml-utils";
import {
  fetchAllProducts,
  formatPriceForMerchant,
  formatWeight,
  isLikelyGTIN,
  normalizeProductType,
  getGoogleCategory,
} from "@/lib/utils/product-utils";
import { logger } from "@/lib/utils/logger";

type ApiProductWithRaw = ApiProduct & { raw_json?: string };

export async function GET() {
  try {
    logger.info("Generating Bing Merchant feed");
    const products = await fetchAllProducts();
    logger.info(`Fetched ${products?.length} products for Bing Merchant feed`);

    if (!products || products.length === 0) {
      logger.warn("No products found for Bing Merchant feed");
      return new NextResponse("No products found", { status: 404 });
    }

    const items: string[] = [];

    for (const product of products) {
      try {
        // Parse raw_json to get actual product data with variants
        const raw = (product as ApiProductWithRaw).raw_json;
        const productData: ApiProduct = raw
          ? (JSON.parse(raw) as ApiProduct)
          : (product as ApiProduct);
        const variants: ApiProductVariant[] = productData.variants || [];
        const options: ApiProductOption[] = productData.options || [];

        if (!variants || variants.length === 0) {
          console.log("Product missing variants:", product.id);
          continue;
        }

        for (const variant of variants) {
          try {
            const colorOption = options.find(
              (option: ApiProductOption) =>
                option.name.toLowerCase() === "color"
            );
            const sizeOption = options.find(
              (option: ApiProductOption) => option.name.toLowerCase() === "size"
            );

            let color = "";
            let size = "";

            if (colorOption) {
              const colorIndex = options.indexOf(colorOption);
              if (colorIndex === 0) color = variant.option1 || "";
              if (colorIndex === 1) color = variant.option2 || "";
              if (colorIndex === 2) color = variant.option3 || "";
            }

            if (sizeOption) {
              const sizeIndex = options.indexOf(sizeOption);
              if (sizeIndex === 0) size = variant.option1 || "";
              if (sizeIndex === 1) size = variant.option2 || "";
              if (sizeIndex === 2) size = variant.option3 || "";
            }

            const priceNum = variant.price;
            const compareNum = variant.compare_at_price;
            let baseAmount: number = priceNum;
            let salePrice: string | null = null;
            if (typeof compareNum === "number" && compareNum > priceNum) {
              baseAmount = compareNum;
              salePrice = formatPriceForMerchant(priceNum);
            }
            const basePrice = formatPriceForMerchant(baseAmount);
            const productType = normalizeProductType(
              productData.product_type || product.product_type
            );
            const weight = formatWeight(variant.grams);
            const maybeGTIN = isLikelyGTIN(variant.sku) ? variant.sku : "";

            const item = `
    <item>
      <g:id>${escapeXml(String(variant.id))}</g:id>
      <g:title><![CDATA[${productData.title} - ${variant.title}]]></g:title>
      <g:description><![CDATA[${
        productData.body_html?.replace(/<[^>]*>/g, "") || productData.title
      }]]></g:description>
      <g:link>${escapeXml(SITE_CONFIG.url)}/products/${escapeXml(
              productData.handle || product.handle
            )}?variant=${escapeXml(String(variant.id))}</g:link>
      <g:image_link>${escapeXml(
        variant.featured_image ||
          productData.images?.[0]?.src ||
          product.images?.[0]?.src ||
          `${SITE_CONFIG.url}/placeholder.svg`
      )}</g:image_link>
      <g:availability>${
        variant.available ? "in stock" : "out of stock"
      }</g:availability>
      <g:price>${escapeXml(basePrice)}</g:price>
      ${salePrice ? `<g:sale_price>${escapeXml(salePrice)}</g:sale_price>` : ""}
      <g:brand>${escapeXml(
        productData.vendor || product.vendor || SITE_CONFIG.name
      )}</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${escapeXml(productType)}</g:product_type>
      <g:google_product_category>${escapeXml(
        getGoogleCategory(productData.product_type || product.product_type)
      )}</g:google_product_category>
      <g:mpn>${escapeXml(variant.sku || String(variant.id))}</g:mpn>
      ${maybeGTIN ? `<g:gtin>${escapeXml(maybeGTIN)}</g:gtin>` : ""}
      ${color ? `<g:color>${escapeXml(color)}</g:color>` : ""}
      ${size ? `<g:size>${escapeXml(size)}</g:size>` : ""}
      <g:shipping_weight>${escapeXml(weight)}</g:shipping_weight>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard</g:service>
        <g:price>9.99 USD</g:price>
      </g:shipping>
    </item>`;

            items.push(item);
          } catch (variantError) {
            console.error(
              `Error processing variant ${variant.id}:`,
              variantError
            );
          }
        }
      } catch (productError) {
        console.error(`Error processing product ${product.id}:`, productError);
      }
    }

    logger.info(`Generated ${items.length} items in Bing Merchant feed`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(SITE_CONFIG.name)} - Product Feed</title>
    <link>${escapeXml(SITE_CONFIG.url)}</link>
    <description>Product feed for Bing Merchant Center</description>
    ${items.join("")}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    logger.error("Error generating Bing Merchant feed", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(`Error generating feed: ${errorMessage}`, {
      status: 500,
    });
  }
}
