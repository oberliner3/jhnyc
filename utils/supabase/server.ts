import { createServerClient } from "@supabase/ssr";
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
      getAll() {
        return cookieStore
          .getAll()
          .map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(cookies) {
        try {
          cookies.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...options })
          );
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.error("[Supabase] Failed to set cookies", error);
          }
        }
      },
    },
    cookieOptions: {
      name: "__supabase",
      domain: process.env.NEXT_PUBLIC_SITE_URL,
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "none",
    },
  });
}
