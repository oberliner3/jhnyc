import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type CartItemInput = {
  product_id: string | number; // Handle both numeric IDs from external API and string UUIDs
  variant_id?: string | null;
  quantity: number;
};

export async function POST(request: NextRequest) {
  try {
    console.log("[CART] Adding item to cart...");
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[CART] Authentication error:", authError?.message);
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body: CartItemInput = await request.json();
    const { product_id, variant_id = null, quantity } = body;

    if (!product_id || quantity <= 0) {
      return NextResponse.json(
        { message: "Invalid product ID or quantity" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert numeric product_id to string for database storage
    const productIdString = String(product_id);

    // Get or create cart
    let cart;
    const { data: fetchedCart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    cart = fetchedCart;

    if (cartError?.code === "PGRST116") {
      // Create new cart if none exists
      const { data: newCart, error: createError } = await supabase
        .from("carts")
        .insert({ user_id: user.id })
        .select("id")
        .single();

      if (createError) throw createError;
      cart = newCart;
    } else if (cartError) {
      throw cartError;
    }

    // Ensure cart exists
    if (!cart) {
      throw new Error("Failed to get or create cart");
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cart.id)
      .eq("product_id", productIdString)
      .eq("variant_id", variant_id)
      .single();

    if (existingItem) {
      // Update existing item quantity
      const { data: updatedItem, error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log(`[CART] Updated cart item:`, updatedItem.id);
      return NextResponse.json(updatedItem, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Add new item to cart
      const { data: newItem, error: insertError } = await supabase
        .from("cart_items")
        .insert({
          cart_id: cart.id,
          product_id: productIdString,
          variant_id,
          quantity,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      console.log(`[CART] Added new cart item:`, newItem.id);
      return NextResponse.json(newItem, {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("[CART] Error adding item to cart:", error);
    return NextResponse.json(
      { message: "Failed to add item to cart" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("[CART] Removing item from cart...");
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[CART] Authentication error:", authError?.message);
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const { cart_id, item_id } = body;

    if (!cart_id || !item_id) {
      return NextResponse.json(
        { message: "Invalid cart ID or item ID" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart_id)
      .eq("id", item_id);

    if (error) throw error;

    console.log(`[CART] Removed cart item: ${item_id} from cart: ${cart_id}`);
    return NextResponse.json(
      { message: "Item removed successfully" },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[CART] Error removing item from cart:", error);
    return NextResponse.json(
      { message: "Failed to remove item from cart" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("[CART] Updating item quantity in cart...");
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[CART] Authentication error:", authError?.message);
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const { cart_id, item_id, quantity } = body;

    if (!cart_id || !item_id || quantity === undefined || quantity < 0) {
      return NextResponse.json(
        { message: "Invalid cart ID, item ID, or quantity" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("cart_id", cart_id)
      .eq("id", item_id)
      .select()
      .single();

    if (error) throw error;

    console.log(`[CART] Updated quantity for item: ${item_id} in cart: ${cart_id} to ${quantity}`);
    return NextResponse.json(data, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[CART] Error updating item quantity in cart:", error);
    return NextResponse.json(
      { message: "Failed to update item quantity in cart" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}