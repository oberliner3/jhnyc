import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";
import { fetchAllProducts } from "@/lib/utils/product-server-utils";
import { logger } from "@/lib/utils/logger";

/**
 * Generate XML sitemap for all products
 *
 * Uses fetchAllProducts() to properly paginate through all products
 * instead of using an arbitrary limit. This ensures all products are
 * included in the sitemap regardless of catalog size.
 *
 * All products are shown with in_stock: true override to ensure
 * maximum visibility in search engines.
 */
export async function GET() {
  try {
    logger.info("Generating products sitemap");

    // Fetch ALL products with automatic pagination
    const products = await fetchAllProducts();

    logger.info(`Fetched ${products.length} products for sitemap`);

    if (!products || products.length === 0) {
      logger.warn("No products found for sitemap");
      const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

      return new NextResponse(emptySitemap, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      });
    }

    const productEntries = products
      .map((product) => {
        // Calculate dynamic priority based on product attributes
        let priority = 0.7;

        // Boost priority for in-stock products
        if (product.in_stock) priority += 0.1;

        // Boost priority for products on sale
        if (
          product.compare_at_price &&
          product.compare_at_price > product.price
        )
          priority += 0.1;

        // Boost priority for highly-rated products
        if (product.rating && product.rating >= 4) priority += 0.1;

        // Cap priority at 0.9 (reserve 1.0 for homepage)
        priority = Math.min(priority, 0.9);

        return `  <url>
    <loc>${SITE_CONFIG.url}/products/${product.handle}</loc>
    <lastmod>${new Date(
      product.updated_at || product.created_at || new Date()
    ).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
      })
      .join("\n");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${productEntries}
</urlset>`;

    logger.info(`Generated sitemap with ${products.length} product URLs`);

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    logger.error("Error generating products sitemap", error);

    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

    return new NextResponse(emptySitemap, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  }
}
