import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";

export async function GET() {
	const staticPages = [
		{ url: SITE_CONFIG.url, priority: 1.0, changefreq: "daily" },
		{ url: `${SITE_CONFIG.url}/collections/all`, priority: 0.9, changefreq: "daily" },
		{ url: `${SITE_CONFIG.url}/search`, priority: 0.8, changefreq: "weekly" },
		{ url: `${SITE_CONFIG.url}/about`, priority: 0.8, changefreq: "monthly" },
		{ url: `${SITE_CONFIG.url}/contact`, priority: 0.7, changefreq: "monthly" },
		{ url: `${SITE_CONFIG.url}/faq`, priority: 0.6, changefreq: "monthly" },
		{ url: `${SITE_CONFIG.url}/help`, priority: 0.6, changefreq: "monthly" },
		{
			url: `${SITE_CONFIG.url}/size-guide`,
			priority: 0.5,
			changefreq: "monthly",
		},
		{
			url: `${SITE_CONFIG.url}/care-instructions`,
			priority: 0.4,
			changefreq: "monthly",
		},
		{
			url: `${SITE_CONFIG.url}/shipping-delivery`,
			priority: 0.6,
			changefreq: "monthly",
		},
		{
			url: `${SITE_CONFIG.url}/returns-exchange`,
			priority: 0.6,
			changefreq: "monthly",
		},
		{
			url: `${SITE_CONFIG.url}/refund-policy`,
			priority: 0.4,
			changefreq: "yearly",
		},
		{
			url: `${SITE_CONFIG.url}/track-order`,
			priority: 0.5,
			changefreq: "weekly",
		},
		{
			url: `${SITE_CONFIG.url}/customer-service`,
			priority: 0.5,
			changefreq: "monthly",
		},
		{
			url: `${SITE_CONFIG.url}/privacy-policy`,
			priority: 0.3,
			changefreq: "yearly",
		},
		{
			url: `${SITE_CONFIG.url}/terms-of-service`,
			priority: 0.3,
			changefreq: "yearly",
		},
		{
			url: `${SITE_CONFIG.url}/cookie-policy`,
			priority: 0.2,
			changefreq: "yearly",
		},
		{
			url: `${SITE_CONFIG.url}/accessibility-statement`,
			priority: 0.2,
			changefreq: "yearly",
		},
		{ url: `${SITE_CONFIG.url}/blog`, priority: 0.6, changefreq: "weekly" },
		{ url: `${SITE_CONFIG.url}/news`, priority: 0.5, changefreq: "weekly" },
		{ url: `${SITE_CONFIG.url}/press`, priority: 0.4, changefreq: "monthly" },
		{ url: `${SITE_CONFIG.url}/careers`, priority: 0.4, changefreq: "monthly" },
	];

	const pageEntries = staticPages
		.map(
			(page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
		)
		.join("\n");

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pageEntries}
</urlset>`;

	return new NextResponse(sitemap, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "public, max-age=3600, s-maxage=3600",
		},
	});
}
