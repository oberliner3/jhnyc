/**
 * Anonymous Cart API
 * Handles CRUD operations for anonymous/guest user carts
 */

import { type NextRequest, NextResponse } from "next/server";
import {
	type AnonymousCart,
	addToAnonymousCart,
	type CartContext,
	clearAnonymousCart,
	getOrCreateAnonymousCart,
	markCartAsAbandoned,
	updateAnonymousCartCustomer,
	updateAnonymousCartItem,
} from "@/lib/anonymous-cart";
import type { ApiProduct, ApiProductVariant } from "@/lib/types";

// Helper to get IP address from request
function getClientIP(request: NextRequest): string {
	const xForwardedFor = request.headers.get("x-forwarded-for");
	const xRealIP = request.headers.get("x-real-ip");
	const cfConnectingIP = request.headers.get("cf-connecting-ip");

	if (xForwardedFor) {
		return xForwardedFor.split(",")[0].trim();
	}
	if (cfConnectingIP) return cfConnectingIP;
	if (xRealIP) return xRealIP;

	return "unknown";
}

// Helper to get cart context from request
function getCartContextFromRequest(request: NextRequest): CartContext {
	const url = new URL(request.url);
	const userAgent = request.headers.get("user-agent") || undefined;
	const referrer = request.headers.get("referer") || undefined;
	const ipAddress = getClientIP(request);

	return {
		utm_source: url.searchParams.get("utm_source") || undefined,
		utm_medium: url.searchParams.get("utm_medium") || undefined,
		utm_campaign: url.searchParams.get("utm_campaign") || undefined,
		referrer,
		user_agent: userAgent,
		ip_address: ipAddress,
	};
}

/**
 * GET /api/anonymous-cart
 * Retrieve existing anonymous cart by session ID
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url);
		const sessionId = searchParams.get("session_id");

		if (!sessionId) {
			return NextResponse.json(
				{ error: "session_id is required" },
				{ status: 400 },
			);
		}

		const context = getCartContextFromRequest(request);
		const cart = await getOrCreateAnonymousCart(sessionId, context);

		return NextResponse.json({ cart });
	} catch (error) {
		console.error("Error fetching anonymous cart:", error);
		return NextResponse.json(
			{ error: "Failed to fetch cart" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/anonymous-cart
 * Create or update anonymous cart and items
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		const body = await request.json();
		const { action, session_id, ...data } = body;

		if (!session_id) {
			return NextResponse.json(
				{ error: "session_id is required" },
				{ status: 400 },
			);
		}

		let cart: AnonymousCart;

		switch (action) {
			case "add_item": {
				const { product, variant, quantity = 1 } = data;
				if (!product) {
					return NextResponse.json(
						{ error: "product is required" },
						{ status: 400 },
					);
				}

				cart = await addToAnonymousCart(
					product as ApiProduct,
					variant as ApiProductVariant | undefined,
					quantity,
				);
				break;
			}

			case "update_item": {
				const { item_id, quantity } = data;
				if (!item_id || typeof quantity !== "number") {
					return NextResponse.json(
						{ error: "item_id and quantity are required" },
						{ status: 400 },
					);
				}

				cart = await updateAnonymousCartItem(item_id, quantity);
				break;
			}

			case "update_customer": {
				const { email, phone } = data;
				cart = await updateAnonymousCartCustomer(email, phone);
				break;
			}

			case "mark_abandoned": {
				await markCartAsAbandoned(session_id);
				const context = getCartContextFromRequest(request);
				cart = await getOrCreateAnonymousCart(session_id, context);
				break;
			}

			default: {
				// Default: create or get cart
				const context = getCartContextFromRequest(request);
				cart = await getOrCreateAnonymousCart(session_id, context);
				break;
			}
		}

		return NextResponse.json({ cart });
	} catch (error) {
		console.error("Error updating anonymous cart:", error);
		return NextResponse.json(
			{ error: "Failed to update cart" },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/anonymous-cart
 * Clear anonymous cart by session ID
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url);
		const sessionId = searchParams.get("session_id");

		if (!sessionId) {
			return NextResponse.json(
				{ error: "session_id is required" },
				{ status: 400 },
			);
		}

		await clearAnonymousCart();

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error clearing anonymous cart:", error);
		return NextResponse.json(
			{ error: "Failed to clear cart" },
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/anonymous-cart
 * Batch update cart items
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
	try {
		const body = await request.json();
		const { session_id, items } = body;

		if (!session_id || !Array.isArray(items)) {
			return NextResponse.json(
				{ error: "session_id and items array are required" },
				{ status: 400 },
			);
		}

		// Process each item update
		for (const item of items) {
			const { id, quantity } = item;
			if (id && typeof quantity === "number") {
				await updateAnonymousCartItem(id, quantity);
			}
		}

		// Get updated cart
		const context = getCartContextFromRequest(request);
		const cart = await getOrCreateAnonymousCart(session_id, context);

		return NextResponse.json({ cart });
	} catch (error) {
		console.error("Error batch updating cart items:", error);
		return NextResponse.json(
			{ error: "Failed to update cart items" },
			{ status: 500 },
		);
	}
}
