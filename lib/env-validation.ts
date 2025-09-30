import { z } from 'zod';

const envSchema = z.object({
  // Required API configuration
  PRODUCT_STREAM_API: z.string().url('PRODUCT_STREAM_API must be a valid URL'),
  PRODUCT_STREAM_X_KEY: z.string().min(1, 'PRODUCT_STREAM_X_KEY is required'),
  
  // Required Shopify configuration - SERVER-SIDE ONLY
  SHOPIFY_SHOP: z.string().min(1, 'SHOPIFY_SHOP is required'),
  SHOPIFY_ACCESS_TOKEN: z.string().min(1, 'SHOPIFY_ACCESS_TOKEN is required'),
  SHOPIFY_TOKEN: z.string().min(1, 'SHOPIFY_TOKEN is required'),
  SHOPIFY_SHOP_NAME: z.string().min(1, 'SHOPIFY_SHOP_NAME is required'),
  
  // Required Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  
  // Optional with defaults
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  NEXT_PUBLIC_STORE_NAME: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      
      console.error('❌ Environment validation failed:');
      errorMessages.forEach(msg => console.error(`  - ${msg}`));
      
      throw new Error(
        `Environment validation failed:\n${errorMessages.join('\n')}`
      );
    }
    throw error;
  }
}

// Utility function to check if we're in production
export function isProduction(): boolean {
  return validateEnv().NODE_ENV === 'production';
}

// Utility function to check if we're in development
export function isDevelopment(): boolean {
  return validateEnv().NODE_ENV === 'development';
}

// Get validated environment variables safely
export function getEnv(): Env {
  return validateEnv();
}