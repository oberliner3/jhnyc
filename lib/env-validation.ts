import { z } from "zod";

// Schema for server-side environment variables
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  PRODUCT_STREAM_API: z.string().url(),
  PRODUCT_STREAM_X_KEY: z.string().min(1),
  // Add other server-side variables here
});

// Schema for client-side environment variables (prefixed with NEXT_PUBLIC_)
const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_STORE_NAME: z.string().min(1),
  NEXT_PUBLIC_CHAT_WIDGET_ENABLED: z.preprocess(
    (str) => str === 'true' || str === '1',
    z.boolean().default(false)
  ),
  NEXT_PUBLIC_EXPERIENCE_TRACKING_ENABLED: z.preprocess(
    (str) => str === 'true' || str === '1',
    z.boolean().default(false)
  ),
  NEXT_PUBLIC_EXPERIENCE_TRACKING_SAMPLE_RATE: z.preprocess(
    (val) => (val ? parseFloat(String(val)) : 1.0),
    z.number().min(0).max(1).default(1.0)
  ),
  NEXT_PUBLIC_EXPERIENCE_TRACKING_DEBUG: z.preprocess(
    (str) => str === 'true' || str === '1',
    z.boolean().default(false)
  ),
});

// Parse and validate server-side environment variables
export const serverEnv = serverSchema.parse(process.env);

// Parse and validate client-side environment variables
export const publicEnv = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME,
  NEXT_PUBLIC_CHAT_WIDGET_ENABLED: process.env.NEXT_PUBLIC_CHAT_WIDGET_ENABLED,
  NEXT_PUBLIC_EXPERIENCE_TRACKING_ENABLED: process.env.NEXT_PUBLIC_EXPERIENCE_TRACKING_ENABLED,
  NEXT_PUBLIC_EXPERIENCE_TRACKING_SAMPLE_RATE: process.env.NEXT_PUBLIC_EXPERIENCE_TRACKING_SAMPLE_RATE,
  NEXT_PUBLIC_EXPERIENCE_TRACKING_DEBUG: process.env.NEXT_PUBLIC_EXPERIENCE_TRACKING_DEBUG,
});
