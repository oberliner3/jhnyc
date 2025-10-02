"use server";
import { redirect } from "next/navigation";
import { LIMITS, ERROR_MESSAGES } from "./constants";
import { ShopifyApiError, logError } from "./errors";
import { createSimpleDraftOrder } from "./shopify-client";
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

		// Create draft order using the modern Shopify client
		const draftOrder = await createSimpleDraftOrder({
			productTitle: tracking.product_title || invoiceNumber,
			price: product.price,
			quantity: quantity,
		});

		if (!draftOrder?.invoiceUrl) {
			throw new ShopifyApiError("No invoice URL returned from Shopify");
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
		if (error instanceof ShopifyApiError) {
			throw new Error(ERROR_MESSAGES.SHOPIFY_ERROR);
		}

		throw new Error(
			error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR
		);
	}
}
