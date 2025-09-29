import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/api";
import { SITE_CONFIG } from "@/lib/constants";
import type { ApiProduct, ApiProductVariant } from "@/lib/types";

export async function GET() {
  try {
    const products = await getAllProducts({ limit: 1000 });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${SITE_CONFIG.name} - Product Feed</title>
    <link>${SITE_CONFIG.url}</link>
    <description>Product feed for Bing Merchant Center</description>
    ${products
      .flatMap((product: ApiProduct) =>
        product.variants.map((variant: ApiProductVariant) => {
          const colorOption = product.options.find(
            (option) => option.name.toLowerCase() === "color"
          );
          const sizeOption = product.options.find(
            (option) => option.name.toLowerCase() === "size"
          );

          let color = "";
          let size = "";

          if (colorOption) {
            const colorIndex = product.options.indexOf(colorOption);
            if (colorIndex === 0) color = variant.option1 || "";
            if (colorIndex === 1) color = variant.option2 || "";
            if (colorIndex === 2) color = variant.option3 || "";
          }

          if (sizeOption) {
            const sizeIndex = product.options.indexOf(sizeOption);
            if (sizeIndex === 0) size = variant.option1 || "";
            if (sizeIndex === 1) size = variant.option2 || "";
            if (sizeIndex === 2) size = variant.option3 || "";
          }

          return `
    <item>
      <g:id>${variant.id}</g:id>
      <g:title><![CDATA[${product.title} - ${variant.title}]]></g:title>
      <g:description><![CDATA[${
        product.body_html?.replace(/<[^>]*>/g, "") || product.title
      }]]></g:description>
      <g:link>${SITE_CONFIG.url}/products/${product.handle}?variant=${
            variant.id
          }</g:link>
      <g:image_link>${
        variant.featured_image ||
        product.images?.[0]?.src ||
        `${SITE_CONFIG.url}/placeholder.svg`
      }</g:image_link>
      <g:availability>${
        variant.available ? "in stock" : "out of stock"
      }</g:availability>
      <g:price>${variant.price} USD</g:price>
      ${
        variant.compare_at_price
          ? `<g:sale_price>${variant.price} USD</g:sale_price>`
          : ""
      }
      <g:brand>${product.vendor || SITE_CONFIG.name}</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${product.product_type || "General"}</g:product_type>
      <g:google_product_category>${getGoogleCategory(
        product.product_type
      )}</g:google_product_category>
      <g:mpn>${variant.sku || variant.id}</g:mpn>
      <g:gtin>${variant.sku || ""}</g:gtin>
      ${color ? `<g:color>${color}</g:color>` : ""}
      ${size ? `<g:size>${size}</g:size>` : ""}
      <g:shipping_weight>${
        variant.grams ? `${variant.grams}g` : "100g"
      }</g:shipping_weight>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard</g:service>
        <g:price>9.99 USD</g:price>
      </g:shipping>
    </item>`;
        })
      )
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
    console.error("Error generating Bing Merchant feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
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
