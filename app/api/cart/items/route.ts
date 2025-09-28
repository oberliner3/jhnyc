import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
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

  const { cart_id, product_id, variant_id, quantity } = await request.json();

  const { data: cartItem, error } = await supabase
    .from("cart_items")
    .insert({ cart_id, product_id, variant_id, quantity })
    .select()
    .single();

  if (error) {
    console.error("[API] Failed to add item to cart in Supabase:", error);
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new NextResponse(JSON.stringify(cartItem), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT(request: Request) {
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

  const { id, quantity } = await request.json();

  const { data: updatedCartItem, error } = await supabase
    .from("cart_items")
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[API] Failed to update cart item in Supabase:", error);
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new NextResponse(JSON.stringify(updatedCartItem), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(request: Request) {
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

  const { id } = await request.json();

  const { error } = await supabase.from("cart_items").delete().eq("id", id);

  if (error) {
    console.error("[API] Failed to remove cart item from Supabase:", error);
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new NextResponse(JSON.stringify({ message: "Item removed" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
