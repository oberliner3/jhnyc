import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // The `cookies().set()` method can only be called in a Server Action or Route Handler.
          // Log for visibility in development; ignore in production to avoid noisy logs.
          if (process.env.NODE_ENV !== "production") {
            console.error("[Supabase] Failed to set cookie", {
              name,
              message: (error as Error)?.message,
            });
          }
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch (error) {
          // The `cookies().set()` method can only be called in a Server Action or Route Handler.
          if (process.env.NODE_ENV !== "production") {
            console.error("[Supabase] Failed to remove cookie", {
              name,
              message: (error as Error)?.message,
            });
          }
        }
      },
    },
  });
}
