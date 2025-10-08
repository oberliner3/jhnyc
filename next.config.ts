import "./lib/load-env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // ✅ IMAGE SETTINGS (Shopify + CDN + local dev)
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "placeholdit.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "moritotabi.com" },
      { hostname: "localhost" },
      { protocol: "https", hostname: "**.jhuangnyc.com" },
      { protocol: "https", hostname: "**.vohovintage.shop" },
      { protocol: "https", hostname: "jhuangnyc.com", pathname: "/cdn/**" },
    ],
  },

  // ✅ REWRITES: allow /p/... to map to internal pages
  async rewrites() {
    return [
      {
        source: "/p/:path*",
        destination: "/:path*", // internally maps /p/... → /...
      },
    ];
  },

  // ✅ REDIRECTS: keep existing ones
  async redirects() {
    return [
      { source: "/products", destination: "/collections/all", permanent: true },
      { source: "/collections", destination: "/collections/all", permanent: true },
    ];
  },

  // ✅ HEADERS: iframe embedding + security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Allow embedding in vohovintage.shop iframe
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://www.vohovintage.shop",
          },
          // Other security headers
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
