import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    // Keep error/warn logs in production for debugging
    removeConsole: process.env.NODE_ENV === 'production' 
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "**.jhuangnyc.com" },
      { protocol: "https", hostname: "**.vohovintage.shop" },
    ],
  },
  async redirects() {
    return [
      { source: "/products", destination: "/collections/all", permanent: true },
      { source: "/collections", destination: "/collections/all", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Allow jhuangnyc.com to be embedded in vohovintage.shop iframe
          { 
            key: "Content-Security-Policy", 
            value: "frame-ancestors 'self' https://www.vohovintage.shop https://vohovintage.shop" 
          },
        ],
      },
    ];
  },
};

export default nextConfig;