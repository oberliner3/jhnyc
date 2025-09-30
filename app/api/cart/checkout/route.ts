import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface Product {
	price: number;
	// Add other product properties if needed
}

interface CartItem {
	product_id: string;
	variant_id: string;
	quantity: number;
	products: Product;
	// Add other cart item properties if needed
}

type CheckoutInput = {
	shipping_address?: {
		first_name?: string;
		last_name?: string;
		address1?: string;
		address2?: string;
		city?: string;
		province?: string;
		country?: string;
		zip?: string;
	};
	billing_address?: {
		first_name?: string;
		last_name?: string;
		address1?: string;
		address2?: string;
		city?: string;
		province?: string;
		country?: string;
		zip?: string;
	};
};

export async function POST(request: NextRequest) {
	try {
		console.log("[CART] Processing checkout...");
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

		const body: CheckoutInput = await request.json();

		// Get user's cart with items
		const { data: cart, error: cartError } = await supabase
			.from("carts")
			.select(`
        *,
        cart_items(
          *,
          products(*)
        )
      `)
			.eq("user_id", user.id)
			.single();

		if (cartError) {
			if (cartError.code === "PGRST116") {
				return NextResponse.json(
					{ message: "Cart is empty" },
					{ status: 400, headers: { "Content-Type": "application/json" } },
				);
			}
			throw cartError;
		}

		if (!cart.cart_items || cart.cart_items.length === 0) {
			return NextResponse.json(
				{ message: "Cart is empty" },
				{ status: 400, headers: { "Content-Type": "application/json" } },
			);
		}

		// Calculate total
		let total = 0;
		const orderItems = cart.cart_items.map((item: CartItem) => {
			const product = item.products;
			const price = product.price || 0;
			total += price * item.quantity;
			return {
				product_id: String(item.product_id), // Convert to string for consistency
				variant_id: item.variant_id,
				quantity: item.quantity,
				price: price,
			};
		});

		// Create order
		const { data: order, error: orderError } = await supabase
			.from("orders")
			.insert({
				user_id: user.id,
				total: total,
				shipping_address: body.shipping_address || null,
				billing_address: body.billing_address || null,
				status: "Pending",
			})
			.select()
			.single();

		if (orderError) throw orderError;

		// Create order items
		const orderItemsWithOrderId = orderItems.map((item: CartItem) => ({
			...item,
			order_id: order.id,
		}));

		const { error: orderItemsError } = await supabase
			.from("order_items")
			.insert(orderItemsWithOrderId);

		if (orderItemsError) throw orderItemsError;

		// Clear cart after successful checkout
		const { error: clearCartError } = await supabase
			.from("cart_items")
			.delete()
			.eq("cart_id", cart.id);

		if (clearCartError) {
			console.warn(
				"[CART] Failed to clear cart after checkout:",
				clearCartError,
			);
		}

		console.log(`[CART] Checkout completed for order:`, order.id);
		return NextResponse.json(
			{
				order_id: order.id,
				total: total,
				status: "success",
				message: "Order created successfully",
			},
			{
				status: 201,
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("[CART] Error processing checkout:", error);
		return NextResponse.json(
			{ message: "Failed to process checkout" },
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
}
