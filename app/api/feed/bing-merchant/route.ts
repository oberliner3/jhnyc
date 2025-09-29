import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/api";
import { SITE_CONFIG } from "@/lib/constants";
import type { ApiProduct, ApiProductOption, ApiProductVariant } from "@/lib/types";

type ApiProductWithRaw = ApiProduct & { raw_json?: string };

// Escape special XML characters
function escapeXml(str: string | undefined | null): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function fetchAllProducts(): Promise<ApiProduct[]> {
  const pageSize = 250;
  let page = 1;
  const all: ApiProduct[] = [];
  while (true) {
    const batch = await getAllProducts({ limit: pageSize, page });
    if (!batch || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < pageSize) break;
    page++;
  }
  return all;
}

export async function GET() {
  try {
    // Fetch all products with pagination to include every item
    const products = await fetchAllProducts();
    console.log("Total products fetched:", products?.length);

    if (!products || products.length === 0) {
      return new NextResponse("No products found", { status: 404 });
    }

    const items: string[] = [];

    for (const product of products) {
      try {
        // Parse raw_json to get actual product data with variants
        const raw = (product as ApiProductWithRaw).raw_json;
        const productData: ApiProduct = raw ? (JSON.parse(raw) as ApiProduct) : (product as ApiProduct);
        const variants: ApiProductVariant[] = productData.variants || [];
        const options: ApiProductOption[] = productData.options || [];
        
        if (!variants || variants.length === 0) {
          console.log("Product missing variants:", product.id);
          continue;
        }

        for (const variant of variants) {
          try {
            const colorOption = options.find(
              (option: ApiProductOption) => option.name.toLowerCase() === "color"
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
              salePrice = formatPriceForGMC(priceNum);
            }
            const basePrice = formatPriceForGMC(baseAmount);
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

    console.log(`Generated ${items.length} items in feed`);

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
    console.error("Error generating Bing Merchant feed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return new NextResponse(`Error generating feed: ${errorMessage}`, {
      status: 500,
    });
  }
}

function getGoogleCategory(category: string | undefined): string {
  if (!category) return "166";

  const categoryMap: Record<string, string> = {
    electronics: "172",
    clothing: "1604",
    shoes: "187",
    accessories: "166",
    home: "632",
    beauty: "172",
    sports: "499",
    books: "784",
    toys: "220",
    automotive: "888",
    health: "499",
    jewelry: "166",
    bags: "166",
    watches: "166",
    furniture: "632",
    kitchen: "632",
    garden: "632",
    office: "166",
    baby: "2984",
    pet: "1281",
    travel: "166",
    music: "166",
    movies: "166",
    games: "166",
    software: "166",
    tools: "632",
    outdoor: "499",
    fitness: "499",
    art: "166",
    crafts: "166",
    party: "166",
    seasonal: "166",
    clearance: "166",
    sale: "166",
    new: "166",
    featured: "166",
    bestseller: "166",
    trending: "166",
  };

  return categoryMap[category.toLowerCase()] || "166";
}

function normalizeProductType(input?: string): string {
  if (!input) return "General";
  const trimmed = input.trim().replace(/^([>\/\-\s])+/, "");
  const parts = trimmed
    .split(/>|\//)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return parts.length ? parts.join(" > ") : "General";
}

function formatPriceForGMC(amount: number, currency: string = "USD"): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return `${n.toFixed(2)} ${currency}`;
}

function formatWeight(grams?: number): string {
  const g = typeof grams === "number" && grams > 0 ? grams : 100;
  return `${g} g`;
}

function isLikelyGTIN(value?: string): boolean {
  if (!value) return false;
  const digits = value.replace(/\s+/g, "");
  return /^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(digits);
}