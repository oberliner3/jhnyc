import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/products/",
        "/categories/",
        "/feed/google-merchant",
        "/feed/microsoft-merchant",

        "/collections/all",
        "/collections/",
      ],
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
