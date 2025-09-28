import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    console.log("[CART] Updating cart item...");
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

    const { itemId } = await context.params;
    const body = await request.json();
    const { quantity } = body;

    if (quantity <= 0) {
      return NextResponse.json(
        { message: "Quantity must be greater than 0" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // For this route, itemId is the cart_item ID (UUID), not the product ID
    // We don't need to convert it as it's already a UUID

    // Verify the item belongs to the user's cart
    const { data: _item, error: fetchError } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        carts!inner(user_id)
      `
      )
      .eq("id", itemId)
      .eq("carts.user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { message: "Cart item not found" },
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      throw fetchError;
    }

    const { data: updatedItem, error: updateError } = await supabase
      .from("cart_items")
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log(`[CART] Updated cart item:`, updatedItem.id);
    return NextResponse.json(updatedItem, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[CART] Error updating cart item:", error);
    return NextResponse.json(
      { message: "Failed to update cart item" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    console.log("[CART] Removing cart item...");
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

    const { itemId } = await context.params;

    // Log request details for debugging and monitoring
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const requestId = request.headers.get('x-request-id') || 'no-id';
    console.log(`[CART] DELETE request for item: ${itemId} by user: ${user.id}`, {
      requestId,
      userAgent: userAgent.substring(0, 100), // Limit length
      timestamp: new Date().toISOString()
    });

    // Verify the item belongs to the user's cart before deleting
    const { data: _item, error: fetchError } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        carts!inner(user_id)
      `
      )
      .eq("id", itemId)
      .eq("carts.user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { message: "Cart item not found" },
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      throw fetchError;
    }

    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (deleteError) throw deleteError;

    console.log(`[CART] Removed cart item:`, itemId);
    return NextResponse.json(
      { message: "Cart item removed successfully" },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[CART] Error removing cart item:", error);
    return NextResponse.json(
      { message: "Failed to remove cart item" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
