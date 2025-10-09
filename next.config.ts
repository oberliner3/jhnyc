import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn", "log"] } // Keep logs for debugging
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
  // No headers here - middleware handles CSP dynamically
};

export default nextConfig;
