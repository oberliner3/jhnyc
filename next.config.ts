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

  // ✅ IMAGE SETTINGS (expanded for proxy + Shopify + original site)
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Common external sources
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "placeholdit.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "moritotabi.com" },
      { hostname: "localhost" },

      // ✅ Allow images when proxied through your main domains
      { protocol: "https", hostname: "**.jhuangnyc.com" },
      { protocol: "https", hostname: "**.vohovintage.shop" },
       {
        protocol: "https",
        hostname: "jhuangnyc.com",
        pathname: "/cdn/**",
      },
    ],
  },

  // ✅ REWRITES — Make /p/... act as internal alias for normal pages
  // async rewrites() {
  //   return [
  //     {
  //       source: "/p/:path*",
  //       destination: "/:path*", // Maps /p/... internally → /...
  //     },
  //   ];
  // },

  // ✅ REDIRECTS — Your original ones (unchanged)
  async redirects() {
    return [
      {
        source: "/products",
        destination: "/collections/all",
        permanent: true,
      },
      {
        source: "/collections",
        destination: "/collections/all",
        permanent: true,
      },
    ];
  },

  // ✅ HEADERS — Kept same as before for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
