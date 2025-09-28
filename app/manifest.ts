import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONFIG.name,
    short_name: "Originz",
    background_color: "#ffffff",
    theme_color: "#336571",
    categories: ["shopping", "ecommerce", "lifestyle", "business"],
    description:
      "Premium e-commerce storefront delivering quality products with exceptional service. Shop the latest trends and exclusive deals.",
    dir: "auto",
    display: "standalone",
    lang: "en",
    orientation: "portrait-primary",
    start_url: SITE_CONFIG.url,
    scope: SITE_CONFIG.url,
    id: "originz-store",
    prefer_related_applications: false,

    shortcuts: [
      {
        name: "Shop All Products",
        url: "/products",
        description: "Browse our complete product catalog",
        icons: [
          {
            src: "/icons/shop-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "My Account",
        url: "/account",
        description: "Manage your account and orders",
        icons: [
          {
            src: "/icons/account-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Shopping Cart",
        url: "/cart",
        description: "View your cart and checkout",
        icons: [
          {
            src: "/icons/cart-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Track Orders",
        url: "/account/orders",
        description: "Track your recent orders",
        icons: [
          {
            src: "/icons/track-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Wishlist",
        url: "/account/wishlist",
        description: "View your saved items",
        icons: [
          {
            src: "/icons/heart-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Search",
        url: "/search",
        description: "Search for products",
        icons: [
          {
            src: "/icons/search-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Contact Support",
        url: "/contact",
        description: "Get help and support",
        icons: [
          {
            src: "/icons/support-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Deals & Offers",
        url: "/products?filter=on-sale",
        description: "Browse current deals and discounts",
        icons: [
          {
            src: "/icons/deals-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
    ],
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/desktop-home.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Homepage on desktop",
      },
      {
        src: "/screenshots/desktop-products.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Product catalog on desktop",
      },
      {
        src: "/screenshots/mobile-home.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Homepage on mobile",
      },
      {
        src: "/screenshots/mobile-cart.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Shopping cart on mobile",
      },
    ],
    related_applications: [
      {
        platform: "webapp",
        url: SITE_CONFIG.url,
      },
    ],
    protocol_handlers: [
      {
        protocol: "web+originz",
        url: "/products?handle=%s",
      },
    ],
    file_handlers: [
      {
        action: "/upload",
        accept: {
          "image/*": [".jpg", ".jpeg", ".png", ".webp"],
        },
      },
    ],
    share_target: {
      action: "/share",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        url: "url",
        files: [
          {
            name: "image",
            accept: ["image/*"],
          },
        ],
      },
    },
  };
}
