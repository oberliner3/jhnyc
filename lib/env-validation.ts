import { z } from 'zod';

// Separate schemas for server-only and public envs
const serverEnvSchema = z.object({
  // Required API configuration (server-only)
  PRODUCT_STREAM_API: z.string().url('PRODUCT_STREAM_API must be a valid URL'),
  PRODUCT_STREAM_X_KEY: z.string().min(1, 'PRODUCT_STREAM_X_KEY is required'),

  // Required Shopify configuration - SERVER-SIDE ONLY
  SHOPIFY_SHOP: z.string().min(1, 'SHOPIFY_SHOP is required'),
  SHOPIFY_ACCESS_TOKEN: z.string().min(1, 'SHOPIFY_ACCESS_TOKEN is required'),
  SHOPIFY_TOKEN: z.string().min(1, 'SHOPIFY_TOKEN is required'),
  SHOPIFY_SHOP_NAME: z.string().min(1, 'SHOPIFY_SHOP_NAME is required'),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const publicEnvSchema = z.object({
  // Public (client) configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL').optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required').optional(),
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  NEXT_PUBLIC_STORE_NAME: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development').optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

let cachedServerEnv: ServerEnv | null = null;
let cachedPublicEnv: PublicEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;
  try {
    cachedServerEnv = serverEnvSchema.parse(process.env);
    return cachedServerEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const msgs = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      console.error('❌ Server environment validation failed:');
      msgs.forEach((m) => console.error(`  - ${m}`));
      throw new Error(`Server environment validation failed:\n${msgs.join('\n')}`);
    }
    throw error;
  }
}

export function getPublicEnv(): PublicEnv {
  if (cachedPublicEnv) return cachedPublicEnv;
  const parsed = publicEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const msgs = parsed.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
    console.warn('⚠ Public environment validation warnings:');
    msgs.forEach((m) => console.warn(`  - ${m}`));
    // Return best-effort defaults without throwing to avoid crashing the client
    cachedPublicEnv = {
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV as any,
    };
    return cachedPublicEnv;
  }
  cachedPublicEnv = parsed.data;
  return cachedPublicEnv;
}

export function isProduction(): boolean {
  return (process.env.NODE_ENV || 'development') === 'production';
}

export function isDevelopment(): boolean {
  return (process.env.NODE_ENV || 'development') === 'development';
}
