"use server";

import { redirect } from "next/navigation";
import { logError } from "@/lib/errors";
import { LIMITS, ERROR_MESSAGES } from "@/lib/constants";
import { generateInvoiceNumber } from "@/lib/utils/invoice";
import type { ClientCartItem } from "@/lib/types";

/**
 * Server Action suitable for use as a <form action={buyNowAction}> handler.
 * Expects FormData fields matching the Buy Now button's hidden inputs.
 * Enhanced with comprehensive validation and error handling.
 * Now supports UTM parameters and generates invoice numbers like the PHP implementation.
 */
export async function buyNowAction(formData: FormData): Promise<never> {
  // Extract and validate form data
  const productId = String(formData.get("productId") || "").trim();
  const variantId = String(formData.get("variantId") || "").trim();
  const price = Number(formData.get("price"));
  const quantity = Number(formData.get("quantity"));
  const productTitle = String(formData.get("productTitle") || "").trim();
  const productImage = String(formData.get("productImage") || "").trim();
  const customerEmail = String(formData.get("customerEmail") || "").trim();

  // Extract UTM parameters (matching PHP implementation)
  const utmSource = String(formData.get("utm_source") || "google").trim();
  const utmMedium = String(formData.get("utm_medium") || "cpc").trim();
  const utmCampaign = String(formData.get("utm_campaign") || "buy-now").trim();

  // Log the request for debugging (production-safe)
  console.log("[buyNowAction] Processing request:", {
    productId,
    variantId,
    price,
    quantity,
    productTitle: productTitle.substring(0, 50),
    hasImage: !!productImage,
    utmSource,
    utmMedium,
    utmCampaign,
  });

  // Enhanced validation
  if (!productId) {
    const error = new Error("Product ID is required");
    console.error("[buyNowAction] Validation error:", error.message);
    throw error;
  }
  if (!variantId) {
    const error = new Error("Variant ID is required");
    console.error("[buyNowAction] Validation error:", error.message);
    throw error;
  }
  if (!Number.isFinite(price) || price <= 0) {
    const error = new Error("Valid price is required");
    console.error("[buyNowAction] Validation error:", error.message);
    throw error;
  }
  if (
    !Number.isFinite(quantity) ||
    quantity < LIMITS.MIN_QUANTITY_PER_ITEM ||
    quantity > LIMITS.MAX_QUANTITY_PER_ITEM
  ) {
    const error = new Error(
      `Quantity must be between ${LIMITS.MIN_QUANTITY_PER_ITEM} and ${LIMITS.MAX_QUANTITY_PER_ITEM}`
    );
    console.error("[buyNowAction] Validation error:", error.message);
    throw error;
  }
  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    const error = new Error(ERROR_MESSAGES.INVALID_EMAIL);
    console.error("[buyNowAction] Validation error:", error.message);
    throw error;
  }

  // Generate invoice number using utility function
  const invoiceNumber = generateInvoiceNumber();
  console.log("[buyNowAction] Generated invoice number:", invoiceNumber);

  // Prepare the payload for the /api/draft-orders endpoint
  const payload = {
    lineItems: [
      {
        title: invoiceNumber, // Use generated invoice number as title (matching PHP)
        variantId: variantId,
        productId: productId,
        price: price,
        quantity: quantity,
      },
    ],
    customerEmail: customerEmail || undefined,
    tags: `${utmSource},${utmMedium},${utmCampaign}`, // Combine UTMs into tags
  };

  console.log("[buyNowAction] Calling draft-orders API with payload:", {
    lineItemsCount: payload.lineItems.length,
    hasCustomerEmail: !!payload.customerEmail,
    tags: payload.tags,
  });

  // Call the API to create draft order
  let draftOrder;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/draft-orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    // Read response body as text first (can only read once)
    const responseText = await response.text();

    console.log("[buyNowAction] API response status:", response.status);

    if (!response.ok) {
      let errorMessage = "Failed to create draft order via API.";
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorMessage;
        console.error("[buyNowAction] API error response:", errorData);
      } catch (parseError) {
        // If response is not JSON, show the text
        errorMessage = `API returned non-JSON response (${
          response.status
        }): ${responseText.substring(0, 200)}`;
        console.error(
          "[buyNowAction] Failed to parse error response:",
          parseError
        );
      }

      logError(new Error(errorMessage), {
        context: "buyNowAction - API call failed",
        formData: Object.fromEntries(formData.entries()),
        responseStatus: response.status,
      });

      throw new Error(errorMessage);
    }

    // Parse the successful response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error(
        "[buyNowAction] Failed to parse success response:",
        parseError
      );
      const error = new Error(
        `API returned invalid JSON response: ${responseText.substring(0, 200)}`
      );

      logError(error, {
        context: "buyNowAction - JSON parse failed",
        formData: Object.fromEntries(formData.entries()),
      });

      throw error;
    }

    draftOrder = responseData.draftOrder;

    if (!draftOrder?.invoiceUrl) {
      console.error("[buyNowAction] No invoice URL in response:", responseData);
      const error = new Error("No invoice URL returned from draft order API.");

      logError(error, {
        context: "buyNowAction - No invoice URL",
        formData: Object.fromEntries(formData.entries()),
        responseData,
      });

      throw error;
    }

    console.log("[buyNowAction] Draft order created successfully:", {
      draftOrderId: draftOrder.id,
      hasInvoiceUrl: !!draftOrder.invoiceUrl,
    });
  } catch (error) {
    // Log the error with full context
    console.error("[buyNowAction] Error occurred:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      formData: Object.fromEntries(formData.entries()),
    });

    logError(error instanceof Error ? error : new Error("Unknown error"), {
      context: "buyNowAction",
      formData: Object.fromEntries(formData.entries()),
    });

    // Re-throw with user-friendly message
    throw new Error(
      error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR
    );
  }

  // Append all tracking parameters to the invoice URL (matching PHP implementation)
  const finalUrl = new URL(draftOrder.invoiceUrl);

  // UTM parameters
  finalUrl.searchParams.set("utm_source", utmSource);
  finalUrl.searchParams.set("utm_medium", utmMedium);
  finalUrl.searchParams.set("utm_campaign", utmCampaign);

  // Product data for Cloudflare Worker
  if (productTitle) {
    finalUrl.searchParams.set("product_title", productTitle);
  }
  if (productImage) {
    finalUrl.searchParams.set("product_image", productImage);
  }

  console.log(
    "[buyNowAction] Redirecting to:",
    finalUrl.toString().substring(0, 100) + "..."
  );

  // CRITICAL: redirect() must be called OUTSIDE try-catch
  // It throws a special error that Next.js uses to perform the redirect
  // If it's inside try-catch, the error gets caught and logged instead of redirecting
  redirect(finalUrl.toString());
}

/**
 * Server Action for checking out with multiple cart items.
 * Creates a draft order with all items in the cart and redirects to payment.
 * Enhanced with comprehensive validation and error handling.
 */
export async function checkoutCartAction(
  cartItems: ClientCartItem[],
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
  }
): Promise<never> {
  try {
    // Validate cart items
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty. Please add items before checkout.");
    }

    // Validate each cart item
    for (const item of cartItems) {
      if (!item.product?.id) {
        throw new Error("Invalid product in cart");
      }
      if (!item.variant?.id) {
        throw new Error("Invalid variant in cart");
      }
      if (!Number.isFinite(item.variant.price) || item.variant.price <= 0) {
        throw new Error(`Invalid price for ${item.product.title}`);
      }
      if (
        !Number.isFinite(item.quantity) ||
        item.quantity < LIMITS.MIN_QUANTITY_PER_ITEM ||
        item.quantity > LIMITS.MAX_QUANTITY_PER_ITEM
      ) {
        throw new Error(
          `Invalid quantity for ${item.product.title}. Must be between ${LIMITS.MIN_QUANTITY_PER_ITEM} and ${LIMITS.MAX_QUANTITY_PER_ITEM}`
        );
      }
    }

    // Extract UTM parameters with defaults
    const utmSource = utmParams?.source || "cart";
    const utmMedium = utmParams?.medium || "checkout";
    const utmCampaign = utmParams?.campaign || "cart-checkout";

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();

    // Prepare line items for the draft order
    const lineItems = cartItems.map((item) => ({
      productTitle: item.product.title,
      variantId: item.variant.id,
      productId: item.product.id,
      price: item.variant.price,
      quantity: item.quantity,
    }));

    // Prepare the payload for the /api/draft-orders endpoint
    const payload = {
      lineItems,
      tags: `${utmSource},${utmMedium},${utmCampaign},${invoiceNumber}`,
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/draft-orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    // Read response body as text first (can only read once)
    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = "Failed to create draft order via API.";
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        console.log(parseError);
        // If response is not JSON, show the text
        errorMessage = `API returned non-JSON response (${
          response.status
        }): ${responseText.substring(0, 200)}`;
      }
      throw new Error(errorMessage);
    }

    // Parse the successful response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.log(parseError);
      throw new Error(
        `API returned invalid JSON response: ${responseText.substring(0, 200)}`
      );
    }

    const draftOrder = responseData.draftOrder;

    if (!draftOrder?.invoiceUrl) {
      throw new Error("No invoice URL returned from draft order API.");
    }

    // Append tracking parameters to the invoice URL
    const finalUrl = new URL(draftOrder.invoiceUrl);

    // UTM parameters
    finalUrl.searchParams.set("utm_source", utmSource);
    finalUrl.searchParams.set("utm_medium", utmMedium);
    finalUrl.searchParams.set("utm_campaign", utmCampaign);

    // Add invoice number for tracking
    finalUrl.searchParams.set("invoice", invoiceNumber);

    // Redirect to the invoice URL for payment
    redirect(finalUrl.toString());
  } catch (error) {
    logError(error instanceof Error ? error : new Error("Unknown error"), {
      context: "checkoutCartAction",
      itemCount: cartItems?.length || 0,
    });

    // Re-throw with user-friendly message
    throw new Error(
      error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR
    );
  }
}
