import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    PRODUCT_STREAM_API: z.url(),
    PRODUCT_STREAM_X_KEY: z.string().min(1),
    SHOPIFY_ACCESS_TOKEN: z.string().min(1),
    SHOPIFY_TOKEN: z.string().optional(),
    SHOPIFY_SHOP: z.string().optional(),
    SHOPIFY_SHOP_NAME: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.url(),
    NEXT_PUBLIC_STORE_NAME: z.string().min(1),
    NEXT_PUBLIC_CHAT_WIDGET_ENABLED: z.preprocess(
      (str) => str === "true" || str === "1",
      z.boolean().default(false)
    ),
  },
  runtimeEnv: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    PRODUCT_STREAM_API: process.env.PRODUCT_STREAM_API,
    PRODUCT_STREAM_X_KEY: process.env.PRODUCT_STREAM_X_KEY,
    SHOPIFY_ACCESS_TOKEN: process.env.SHOPIFY_ACCESS_TOKEN,
    SHOPIFY_TOKEN: process.env.SHOPIFY_TOKEN,
    SHOPIFY_SHOP: process.env.SHOPIFY_SHOP,
    SHOPIFY_SHOP_NAME: process.env.SHOPIFY_SHOP_NAME,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME,
    NEXT_PUBLIC_CHAT_WIDGET_ENABLED:
      process.env.NEXT_PUBLIC_CHAT_WIDGET_ENABLED,
  },
});
