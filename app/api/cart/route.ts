import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type CartWithItems = {
	id: string;
	user_id: string;
	created_at: string;
	updated_at: string;
	cart_items: Array<{
		id: string;
		cart_id: string;
		product_id: string;
		variant_id: string | null;
		quantity: number;
		created_at: string;
		updated_at: string;
	}>;
};

export async function GET(): Promise<
	NextResponse<
		CartWithItems | { id: null; cart_items: [] } | { message: string }
	>
> {
	try {
		console.log("[CART] Fetching cart...");
		const supabase = await createClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			console.error("[CART] Authentication error:", authError?.message);
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401, headers: { "Content-Type": "application/json" } },
			);
		}

		console.log(`[CART] Fetching cart for user: ${user.id}`);
		const { data: cart, error } = await supabase
			.from("carts")
			.select(`
        *,
        cart_items(*)
      `)
			.eq("user_id", user.id)
			.single();

		// No cart found is not an error, return empty cart
		if (error?.code === "PGRST116") {
			console.log(`[CART] No cart found for user: ${user.id}`);
			return NextResponse.json(
				{ id: null, cart_items: [] },
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		}

		if (error) throw error;

		console.log(`[CART] Fetched cart:`, cart.id);
		return NextResponse.json(cart, {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("[CART] Error fetching cart:", error);
		return NextResponse.json(
			{ message: "Failed to fetch cart" },
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
}

export async function POST(): Promise<
	NextResponse<CartWithItems | { message: string }>
> {
	try {
		console.log("[CART] Creating new cart...");
		const supabase = await createClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			console.error("[CART] Authentication error:", authError?.message);
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401, headers: { "Content-Type": "application/json" } },
			);
		}

		// Check if user already has a cart
		const { data: existingCart } = await supabase
			.from("carts")
			.select("id")
			.eq("user_id", user.id)
			.single();

		if (existingCart) {
			console.log(
				`[CART] User ${user.id} already has a cart:`,
				existingCart.id,
			);
			return NextResponse.json(
				{ message: "Cart already exists" },
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		}

		console.log(`[CART] Creating new cart for user: ${user.id}`);
		const { data: newCart, error } = await supabase
			.from("carts")
			.insert({ user_id: user.id })
			.select(`
        *,
        cart_items(*)
      `)
			.single();

		if (error) throw error;

		console.log(`[CART] Created new cart:`, newCart.id);
		return NextResponse.json(newCart, {
			status: 201,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("[CART] Error creating cart:", error);
		return NextResponse.json(
			{ message: "Failed to create cart" },
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
}
