import { z } from "zod";

// Separate schemas for server-only and public envs
const serverEnvSchemaBase = z.object({
	// Optional API configuration (server-only) - not required if using fallback data
	PRODUCT_STREAM_API: z.string().url("PRODUCT_STREAM_API must be a valid URL").optional(),
	PRODUCT_STREAM_X_KEY: z.string().min(1, "PRODUCT_STREAM_X_KEY is required").optional(),

	// Optional Shopify configuration - SERVER-SIDE ONLY - not required if using fallback data
	SHOPIFY_SHOP: z.string().min(1, "SHOPIFY_SHOP is required").optional(),
	// Accept either SHOPIFY_ACCESS_TOKEN or SHOPIFY_TOKEN; enforce with superRefine below
	SHOPIFY_ACCESS_TOKEN: z.string().min(1).optional(),
	SHOPIFY_TOKEN: z.string().min(1).optional(),
	SHOPIFY_SHOP_NAME: z.string().min(1, "SHOPIFY_SHOP_NAME is required").optional(),

	// Experience tracking configuration (server-only)
	SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required for experience tracking").optional(),

	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
});

const serverEnvSchema = serverEnvSchemaBase.superRefine((data, ctx) => {
  if (
    (process.env.NEXT_PUBLIC_EXPERIENCE_TRACKING_ENABLED === 'true') &&
    !data.SUPABASE_SERVICE_ROLE_KEY
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['SUPABASE_SERVICE_ROLE_KEY'],
      message: 'SUPABASE_SERVICE_ROLE_KEY is required when experience tracking is enabled.',
    });
  }
});

const publicEnvSchema = z.object({
	// Public (client) configuration
	NEXT_PUBLIC_SUPABASE_URL: z
		.string()
		.url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL")
		.optional(),
	NEXT_PUBLIC_SUPABASE_ANON_KEY: z
		.string()
		.min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
		.optional(),
	NEXT_PUBLIC_SITE_URL: z.string().optional(),
	NEXT_PUBLIC_STORE_NAME: z.string().optional(),
	
	// Experience tracking configuration (public)
	  NEXT_PUBLIC_EXPERIENCE_TRACKING_ENABLED: z
			.string()
			.default("true")
			.transform((val) => val === "true")
			.optional(),  NEXT_PUBLIC_EXPERIENCE_TRACKING_SAMPLE_RATE: z
		.string()
		.default("1.0")
		.transform((val) => parseFloat(val) || 1.0)
		.optional(),
	  NEXT_PUBLIC_EXPERIENCE_TRACKING_DEBUG: z
			.string()
			.default("false")
			.transform((val) => val === "true")
			.optional(),	
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development")
		.optional(),
}).superRefine((data, ctx) => {
  if (data.NEXT_PUBLIC_EXPERIENCE_TRACKING_ENABLED) {
    if (!data.NEXT_PUBLIC_SUPABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['NEXT_PUBLIC_SUPABASE_URL'],
        message: 'NEXT_PUBLIC_SUPABASE_URL is required when experience tracking is enabled.',
      });
    }
    if (!data.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['NEXT_PUBLIC_SUPABASE_ANON_KEY'],
        message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required when experience tracking is enabled.',
      });
    }
  }
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
			const msgs = error.issues.map(
				(err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`,
			);
			console.error("❌ Server environment validation failed:");
			msgs.forEach((m: string) => console.error(`  - ${m}`));
			throw new Error(
				`Server environment validation failed:\n${msgs.join("\n")}`,
			);
		}
		throw error;
	}
}

export function getPublicEnv(): PublicEnv {
	if (cachedPublicEnv) return cachedPublicEnv;
	const parsed = publicEnvSchema.safeParse(process.env);
	if (!parsed.success) {
		const msgs = parsed.error.issues.map(
			(err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`,
		);
		console.warn("⚠ Public environment validation warnings:");
		msgs.forEach((m: string) => console.warn(`  - ${m}`));
		// Return best-effort defaults without throwing to avoid crashing the client
		cachedPublicEnv = {
			NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
			NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME,
			NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
			NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
			NEXT_PUBLIC_EXPERIENCE_TRACKING_ENABLED: process.env.NEXT_PUBLIC_EXPERIENCE_TRACKING_ENABLED === "true",
			NEXT_PUBLIC_EXPERIENCE_TRACKING_SAMPLE_RATE: parseFloat(process.env.NEXT_PUBLIC_EXPERIENCE_TRACKING_SAMPLE_RATE || "1.0"),
			NEXT_PUBLIC_EXPERIENCE_TRACKING_DEBUG: process.env.NEXT_PUBLIC_EXPERIENCE_TRACKING_DEBUG === "true",
			NODE_ENV: process.env.NODE_ENV as
				| "development"
				| "production"
				| "test"
				| undefined,
		};
		return cachedPublicEnv;
	}
	cachedPublicEnv = parsed.data;
	return cachedPublicEnv;
}

export function isProduction(): boolean {
	return (process.env.NODE_ENV || "development") === "production";
}

export function isDevelopment(): boolean {
	return (process.env.NODE_ENV || "development") === "development";
}
