"use server";

import { redirect } from "next/navigation";
import { getOrCreateAnonymousCart } from "@/lib/anonymous-cart";
import { createDraftOrder } from "@/lib/shopify-client";
import { createClient } from "@/utils/supabase/server";

export interface CheckoutItem {
	productId: string;
	variantId: string;
	quantity: number;
	price: number;
}

export interface CheckoutCustomer {
	email: string;
	firstName: string;
	lastName: string;
	address: {
		street: string;
		city: string;
		state?: string;
		postalCode?: string;
		country: string;
	};
	phone?: string;
}

export interface CheckoutTotals {
	subtotal: number;
	shipping: number;
	tax: number;
	total: number;
}

export interface CheckoutData {
	items: CheckoutItem[];
	customer: CheckoutCustomer;
	totals: CheckoutTotals;
}

export async function handleCheckout(data: CheckoutData, sessionId: string) {
	try {
		const supabase = await createClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		const userId = user?.id;
		let anonymousCartId: string | undefined;

		if (!user) {
			const anonymousCart = await getOrCreateAnonymousCart(sessionId);
			anonymousCartId = anonymousCart.id;
		}

		// Create order in database
		const { data: order, error: orderError } = await supabase
			.from("orders")
			.insert({
				user_id: userId,
				anonymous_cart_id: anonymousCartId,
				status: "Pending",
				total: data.totals.total,
				shipping_address: {
					name: `${data.customer.firstName} ${data.customer.lastName}`,
					address: data.customer.address.street,
					city: data.customer.address.city,
					state: data.customer.address.state || "",
					postal_code: data.customer.address.postalCode || "",
					country: data.customer.address.country,
					phone: data.customer.phone || "",
				},
				billing_address: {
					name: `${data.customer.firstName} ${data.customer.lastName}`,
					address: data.customer.address.street,
					city: data.customer.address.city,
					state: data.customer.address.state || "",
					postal_code: data.customer.address.postalCode || "",
					country: data.customer.address.country,
					phone: data.customer.phone || "",
				},
			})
			.select()
			.single();

		if (orderError) {
			console.error("Order creation error:", orderError);
			return { success: false, error: "Failed to create order" };
		}

		// Create order items
		const orderItems = data.items.map((item) => ({
			order_id: order.id,
			product_id: item.productId,
			variant_id: item.variantId,
			quantity: item.quantity,
			price: item.price,
		}));

		const { error: itemsError } = await supabase
			.from("order_items")
			.insert(orderItems);

		if (itemsError) {
			console.error("Order items creation error:", itemsError);
			return { success: false, error: "Failed to create order items" };
		}

		// Clear user's cart
		if (userId) {
			const { data: cartData } = await supabase
				.from("carts")
				.select("id")
				.eq("user_id", userId)
				.single();

			if (cartData) {
				const { error: cartError } = await supabase
					.from("cart_items")
					.delete()
					.eq("cart_id", cartData.id);

				if (cartError) {
					console.error("Cart clearing error:", cartError);
				}
			}
		} else if (anonymousCartId) {
			const { error: cartError } = await supabase
				.from("anonymous_cart_items")
				.delete()
				.eq("cart_id", anonymousCartId);

			if (cartError) {
				console.error("Anonymous cart clearing error:", cartError);
			}
		}

		// If Shopify integration is enabled, create draft order
		if (process.env.SHOPIFY_SHOP && process.env.SHOPIFY_ACCESS_TOKEN) {
			try {
				const shopifyData = {
					draft_order: {
						line_items: data.items.map((item) => ({
							title: `Product ${item.productId}`,
							price: item.price.toFixed(2),
							quantity: item.quantity,
							variant_id: item.variantId,
						})),
						customer: {
							email: data.customer.email,
							first_name: data.customer.firstName,
							last_name: data.customer.lastName,
							addresses: [
								{
									first_name: data.customer.firstName,
									last_name: data.customer.lastName,
									address1: data.customer.address.street,
									city: data.customer.address.city,
									zip: data.customer.address.postalCode || "",
									country: data.customer.address.country,
									phone: data.customer.phone || "",
								},
							],
						},
						shipping_address: {
							first_name: data.customer.firstName,
							last_name: data.customer.lastName,
							address1: data.customer.address.street,
							city: data.customer.address.city,
							zip: data.customer.address.postalCode || "",
							country: data.customer.address.country,
							phone: data.customer.phone || "",
						},
						billing_address: {
							first_name: data.customer.firstName,
							last_name: data.customer.lastName,
							address1: data.customer.address.street,
							city: data.customer.address.city,
							zip: data.customer.address.postalCode || "",
							country: data.customer.address.country,
							phone: data.customer.phone || "",
						},
						use_customer_default_address: false,
						note: `Order #${order.id}`,
					},
				};

				const draftOrder = await createDraftOrder({
					line_items: shopifyData.draft_order.line_items,
					customer: shopifyData.draft_order.customer,
				});

				if (draftOrder?.invoiceUrl) {
					redirect(draftOrder.invoiceUrl);
				}
			} catch (shopifyError) {
				console.error("Shopify integration error:", shopifyError);
			}
		}

		return {
			success: true,
			orderId: order.id,
			message: "Order created successfully",
		};
	} catch (error) {
		console.error("Checkout error:", error);
		return {
			success: false,
			error: "An unexpected error occurred during checkout",
		};
	}
}
