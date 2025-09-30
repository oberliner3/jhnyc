import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONFIG.name,
    short_name: "Originz",
    background_color: "#ffffff",
    theme_color: "#336571",
    description:
      "Premium e-commerce storefront delivering quality products with exceptional service. Shop the latest trends and exclusive deals.",
    dir: "auto",
    display: "standalone",
    lang: "en",
    orientation: "portrait-primary",
    start_url: "/",
    scope: "/",
    id: "originz-store",

    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
