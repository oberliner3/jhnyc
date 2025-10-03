"use server";
import { redirect } from "next/navigation";
import { LIMITS, ERROR_MESSAGES } from "./constants";
import { logError } from "./errors";
import type { ApiProduct } from "./types";

import { generateInvoiceNumber } from "./utils/invoice";

/**
 * Handles a campaign "buy now" request on the server.
 * It creates a Shopify draft order and then redirects the user to the checkout URL.
 * This is a Server Action with enhanced validation and error handling.
 */

export async function handleCampaignRedirect(
	product: Pick<ApiProduct, "price" | "quantity">,
	tracking: {
		utm_source?: string;
		utm_medium?: string;
		utm_campaign?: string;
		product_title?: string;
		product_image?: string;
	}
): Promise<never> {
	try {
		// Input validation
		if (!product || typeof product.price !== "number" || product.price <= 0) {
			throw new Error("Invalid product price");
		}

		const quantity = product.quantity || 1;
		if (quantity < LIMITS.MIN_QUANTITY_PER_ITEM ||
			quantity > LIMITS.MAX_QUANTITY_PER_ITEM) {
			throw new Error(
				`Quantity must be between ${LIMITS.MIN_QUANTITY_PER_ITEM} and ${LIMITS.MAX_QUANTITY_PER_ITEM}`
			);
		}

		const invoiceNumber = generateInvoiceNumber();

		// Prepare the payload for the /api/draft-orders endpoint
		const payload = {
			lineItems: [
				{
					productTitle: tracking.product_title || invoiceNumber,
					price: product.price,
					quantity: quantity,
				},
			],
			tags: `${tracking.utm_source || ""},${tracking.utm_medium || ""},${tracking.utm_campaign || ""}`,
		};

		const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/draft-orders`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Failed to create draft order via API.");
		}

		const responseData = await response.json();
		const draftOrder = responseData.draftOrder;

		if (!draftOrder?.invoiceUrl) {
			throw new Error("No invoice URL returned from draft order API.");
		}

		const redirectUrl = new URL(draftOrder.invoiceUrl);

		// Append tracking parameters to the final checkout URL
		Object.entries(tracking).forEach(([key, value]) => {
			if (value && typeof value === "string" && value.trim()) {
				redirectUrl.searchParams.set(key, value.trim());
			}
		});

		redirect(redirectUrl.toString());
	} catch (error) {
		logError(error instanceof Error ? error : new Error("Unknown error"), {
			context: "handleCampaignRedirect",
			product: { price: product.price, quantity: product.quantity },
			tracking,
		});

		// Re-throw with user-friendly message
		throw new Error(
			error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR
		);
	}
}
