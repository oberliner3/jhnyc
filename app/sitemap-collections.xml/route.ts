import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";

export async function GET() {
  const collectionPages = [
    {
      url: `${SITE_CONFIG.url}/collections/all`,
      priority: 0.8,
      changefreq: "daily",
    },
    {
      url: `${SITE_CONFIG.url}/collections/featured`,
      priority: 0.7,
      changefreq: "weekly",
    },
    {
      url: `${SITE_CONFIG.url}/collections/sale`,
      priority: 0.8,
      changefreq: "daily",
    },
    {
      url: `${SITE_CONFIG.url}/collections/new`,
      priority: 0.7,
      changefreq: "weekly",
    },
    {
      url: `${SITE_CONFIG.url}/collections/bestsellers`,
      priority: 0.7,
      changefreq: "weekly",
    },
    {
      url: `${SITE_CONFIG.url}/collections/trending`,
      priority: 0.6,
      changefreq: "weekly",
    },
    {
      url: `${SITE_CONFIG.url}/collections/limited-edition`,
      priority: 0.6,
      changefreq: "weekly",
    },
    {
      url: `${SITE_CONFIG.url}/collections/clearance`,
      priority: 0.5,
      changefreq: "daily",
    },
  ];

  const collectionEntries = collectionPages
    .map(
      (collection) => `  <url>
    <loc>${collection.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${collection.changefreq}</changefreq>
    <priority>${collection.priority}</priority>
  </url>`
    )
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${collectionEntries}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
