import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";
import type { ApiProduct } from "@/lib/types";
import { escapeXml, stripHtml } from "@/lib/utils/xml-utils";
import {
  fetchAllProducts,
  formatPriceForMerchant,
  formatWeight,
} from "@/lib/utils/product-utils";
import { logger } from "@/lib/utils/logger";

export async function GET() {
  try {
    logger.info("Generating Google Merchant feed");
    const products = await fetchAllProducts();
    logger.info(`Fetched ${products.length} products for Google Merchant feed`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(SITE_CONFIG.name)} - Product Feed</title>
    <link>${escapeXml(SITE_CONFIG.url)}</link>
    <description>Product feed for Google Merchant Center</description>
    ${products
      .map((product) => {
        const hasSale =
          typeof product.compare_at_price === "number" &&
          product.compare_at_price > product.price;
        const basePrice = formatPriceForMerchant(
          hasSale && product.compare_at_price
            ? product.compare_at_price
            : product.price
        );
        const salePrice = hasSale
          ? formatPriceForMerchant(product.price)
          : null;
        const weight = formatWeight(product.variants?.[0]?.grams);

        return `
    <item>
      <g:id>${escapeXml(String(product.id))}</g:id>
      <g:title><![CDATA[${product.title?.replace(/<[^>]*>/g, "")}]]></g:title>
      <g:description><![CDATA[${
        stripHtml(product.body_html)?.replace(/<[^>]*>/g, "") || product.title
      }]]></g:description>
      <g:link>${escapeXml(SITE_CONFIG.url)}/products/${escapeXml(
          product.handle
        )}</g:link>
      <g:image_link>${escapeXml(
        product.images?.[0]?.src || `${SITE_CONFIG.url}/placeholder.svg`
      )}</g:image_link>
      <g:availability>in stock</g:availability>
      <g:price>${escapeXml(basePrice)}</g:price>
      ${salePrice ? `<g:sale_price>${escapeXml(salePrice)}</g:sale_price>` : ""}
      <g:brand>${escapeXml(product.vendor || SITE_CONFIG.name)}</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>166</g:google_product_category>
      <g:mpn>${escapeXml(String(product.id))}</g:mpn>
      <g:gtin></g:gtin>
      <g:shipping_weight>${escapeXml(weight)}</g:shipping_weight>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard</g:service>
        <g:price>9.99 USD</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Express</g:service>
        <g:price>19.99 USD</g:price>
      </g:shipping>
      ${
        (product.tags &&
          product.tags.length > 0 &&
          product.tags
            .split(",")
            .map(
              (tag) =>
                `<g:product_detail><g:attribute_name>tag</g:attribute_name><g:attribute_value>${escapeXml(
                  tag.split("_").join(" ").toUpperCase()
                )}</g:attribute_value></g:product_detail>`
            )
            .join("")) ||
        ""
      }
      <g:custom_label_0>${escapeXml(
        String(product.rating || 0)
      )}</g:custom_label_0>
      <g:custom_label_1>${escapeXml(
        String(product.review_count || 0)
      )}</g:custom_label_1>
      <g:custom_label_2>${escapeXml(
        product.vendor || "Unknown"
      )}</g:custom_label_2>
      <g:custom_label_3>${
        product.in_stock ? "Available" : "Out of Stock"
      }</g:custom_label_3>
      <g:custom_label_4>${
        hasSale ? "On Sale" : "Regular Price"
      }</g:custom_label_4>
    </item>`;
      })
      .join("")}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    logger.error("Error generating Google Merchant feed", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
