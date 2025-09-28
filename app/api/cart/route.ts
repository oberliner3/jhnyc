import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: cart, error } = await supabase
    .from("carts")
    .select("*, cart_items(*)")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 means no rows found (no cart yet)
    console.error("[API] Failed to fetch cart from Supabase:", error);
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new NextResponse(JSON.stringify(cart), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: newCart, error } = await supabase
    .from("carts")
    .insert({ user_id: user.id })
    .select("*, cart_items(*)")
    .single();

  if (error) {
    console.error("[API] Failed to create cart in Supabase:", error);
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new NextResponse(JSON.stringify(newCart), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
