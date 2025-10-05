import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data/products";
import { SITE_CONFIG } from "@/lib/constants";

export async function GET() {
	try {
		const products = await getProducts({
      limit: 10000,
      page: 1,
      context: "ssr",
    });

		const productEntries = products
			.map((product) => {
				let priority = 0.7;

				if (product.in_stock) priority += 0.1;
				if (
					product.compare_at_price &&
					product.compare_at_price > product.price
				)
					priority += 0.1;
				if (product.rating && product.rating >= 4) priority += 0.1;

				priority = Math.min(priority, 0.9);

				return `  <url>
    <loc>${SITE_CONFIG.url}/products/${product.handle}</loc>
    <lastmod>${new Date(
			product.updated_at || product.created_at || new Date(),
		).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
			})
			.join("\n");

		const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${productEntries}
</urlset>`;

		return new NextResponse(sitemap, {
			headers: {
				"Content-Type": "application/xml",
				"Cache-Control": "public, max-age=3600, s-maxage=3600",
			},
		});
	} catch (error) {
		console.error("Error generating products sitemap:", error);

		const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

		return new NextResponse(emptySitemap, {
			headers: {
				"Content-Type": "application/xml",
				"Cache-Control": "public, max-age=300, s-maxage=300",
			},
		});
	}
}
