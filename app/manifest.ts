import { SITE_CONFIG } from "@/lib/constants";
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONFIG.name,
    short_name: SITE_CONFIG.domain.split(".")[0],
    background_color: "#336571",
    categories: ["shopping", "ecommerce", "utilities"],
    description: "Premium Store Promotions",
    dir: "auto",
    display: "standalone",
    lang: "en",
    start_url: SITE_CONFIG.url,
    shortcuts: [
      {
        name: "Shop",
        url: "/collection/all",
        description: "Browse massive store deals",
      },
      {
        name: "My Account",
        url: "/account/#sc",
      },
      {
        name: "Track latest orders",
        url: "/track#latest",
      },
    ],
    icons: [
      {
        src: "/web-app-manifest-192x192.png",

        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
