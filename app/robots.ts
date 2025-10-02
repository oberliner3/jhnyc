import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

const PUBLIC_PATHS = [
  "/",
  "/collections/all/",
  "/collections/",
  "/search",
  "/about",
  "/contact",
  "/faq",
  "/help",
  "/size-guide",
  "/care-instructions",
  "/shipping-delivery",
  "/returns-exchange",
  "/refund-policy",
  "/privacy-policy",
  "/terms-of-service",
  "/cookie-policy",
  "/accessibility-statement",
  "/blog/",
  "/news/",
  "/press",
  "/careers",
];

const PRIVATE_PATHS = [
  "/account/",
  "/cart",
  "/checkout/",
  "/admin/",
  "/api/",
  "/_next/",
  "/static/",
  "/offline",
  "/404",
  "/500",
  "*.json",
  "*.xml$",
  "/share",
  "/upload",
];

const GOOGLE_ONLY_PATHS = ["/api/feed/google-merchant"];

const BASE_RULE = {
  allow: PUBLIC_PATHS,
  disallow: PRIVATE_PATHS,
};

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { ...BASE_RULE, userAgent: "*", crawlDelay: 1 },
      {
        userAgent: "Googlebot",
        allow: [...PUBLIC_PATHS, ...GOOGLE_ONLY_PATHS],
        disallow: PRIVATE_PATHS.filter((p) => p !== "/api/" || !GOOGLE_ONLY_PATHS.includes(p)),
        crawlDelay: 0.5,
      },
      {
        userAgent: "Bingbot",
        allow: PUBLIC_PATHS.slice(0, 6), // only core pages
        disallow: PRIVATE_PATHS,
        crawlDelay: 1,
      },
      {
        userAgent: "facebookexternalhit",
        allow: PUBLIC_PATHS.slice(0, 3), // home + collections
        disallow: PRIVATE_PATHS.slice(0, 5), // basic private
      },
      {
        userAgent: "Twitterbot",
        allow: PUBLIC_PATHS.slice(0, 3),
        disallow: PRIVATE_PATHS.slice(0, 5),
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap-index.xml`,
    host: SITE_CONFIG.url,
  };
}