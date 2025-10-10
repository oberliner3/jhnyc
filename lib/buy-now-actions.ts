"use server";

import { LIMITS, ERROR_MESSAGES } from "@/lib/constants";
import { generateInvoiceNumber } from "@/lib/utils/invoice";
import { logError } from "@/lib/errors";

import type { ClientCartItem } from "@/lib/types";

/**
 * Server Action suitable for a <form action={buyNowAction}> handler.
 * Validates input, creates Shopify draft order, appends UTM/product info, returns invoice URL.
 */
export async function buyNowAction(formData: FormData): Promise<string> {
  try {
    // Extract and validate form fields
    const productId = String(formData.get("productId") || "").trim();
    const variantId = String(formData.get("variantId") || "").trim();
    const price = Number(formData.get("price"));
    const quantity = Number(formData.get("quantity"));
    const productTitle = String(formData.get("productTitle") || "").trim();
    const productImage = String(formData.get("productImage") || "").trim();
    const utmSource = String(formData.get("utm_source") || "google").trim();
    const utmMedium = String(formData.get("utm_medium") || "cpc").trim();
    const utmCampaign = String(
      formData.get("utm_campaign") || "buy-now"
    ).trim(); // Basic validations

    if (!Number.isFinite(price) || price <= 0)
      throw new Error("Valid price required");
    if (
      !Number.isFinite(quantity) ||
      quantity < LIMITS.MIN_QUANTITY_PER_ITEM ||
      quantity > LIMITS.MAX_QUANTITY_PER_ITEM
    ) {
      throw new Error(
        `Quantity must be between ${LIMITS.MIN_QUANTITY_PER_ITEM} and ${LIMITS.MAX_QUANTITY_PER_ITEM}`
      );
    }

    const invoiceNumber = generateInvoiceNumber(); // Prepare Shopify REST API draft order payload

    const lineItems = [
      {
        title: invoiceNumber,
        price: price.toFixed(2),
        quantity,
      },
    ];

    const shopifyPayload = {
      draft_order: {
        line_items: lineItems,
        use_customer_default_address: true,
        tags: `invoice:${invoiceNumber},utm_source:${utmSource},utm_medium:${utmMedium},utm_campaign:${utmCampaign}`,
      },
    };

    const shop = process.env.SHOPIFY_SHOP;
    const token = process.env.SHOPIFY_ACCESS_TOKEN;
    if (!shop || !token) throw new Error("Missing Shopify credentials"); // Call Shopify REST API

    const response = await fetch(
      `https://${shop}/admin/api/2024-01/draft_orders.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": token,
        },
        body: JSON.stringify(shopifyPayload),
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = "Failed to create draft order via Shopify API";
      try {
        const data = JSON.parse(responseText);
        errorMessage = data.error || JSON.stringify(data);
      } catch (_) {
        errorMessage = `API returned non-JSON response: ${responseText.substring(
          0,
          200
        )}`;
      }
      logError(new Error(errorMessage), {
        context: "buyNowAction - API Error",
        payload: shopifyPayload,
      });
      throw new Error(errorMessage);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      logError(
        parseError instanceof Error ? parseError : new Error("Invalid JSON"),
        { context: "buyNowAction - Parse JSON" }
      );
      throw new Error("Failed to parse Shopify API response");
    }

    const invoiceUrl = responseData?.draft_order?.invoice_url;
    if (!invoiceUrl) throw new Error("No invoice URL returned from Shopify"); // Append UTM + product info

    const finalUrl = new URL(invoiceUrl);
    finalUrl.searchParams.set("utm_source", utmSource);
    finalUrl.searchParams.set("utm_medium", utmMedium);
    finalUrl.searchParams.set("utm_campaign", utmCampaign);
   // finalUrl.searchParams.set("invoice", invoiceNumber);
    finalUrl.searchParams.set("product_title", productTitle);
    if (productImage && /^https?:\/\//i.test(productImage)) {
      finalUrl.searchParams.set("product_image", productImage);
    }
  

    return finalUrl.toString();
  } catch (error) {
    logError(error instanceof Error ? error : new Error("Unknown error"), {
      context: "buyNowAction",
      formData: Object.fromEntries(formData.entries()),
    });
    throw new Error(
      error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR
    );
  }
}

/**
 * Checkout multiple cart items.
 * Returns a final invoice URL (for iframe or direct redirect).
 */
export async function checkoutCartAction(
  cartItems: ClientCartItem[],
  utmParams?: { source?: string; medium?: string; campaign?: string }
): Promise<string> {
  try {
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty. Please add items before checkout.");
    } // Validate each cart item

    for (const item of cartItems) {
      if (!item.variant?.id) {
        throw new Error(
          `Invalid variant in cart for product: ${item.product?.title}`
        );
      }
      if (
        !Number.isFinite(item.quantity) ||
        item.quantity < LIMITS.MIN_QUANTITY_PER_ITEM
      ) {
        throw new Error(
          `Invalid quantity for ${item.product.title}. Must be at least ${LIMITS.MIN_QUANTITY_PER_ITEM}.`
        );
      }
    }

    const utmSource = utmParams?.source || "cart";
    const utmMedium = utmParams?.medium || "checkout";
    const utmCampaign = utmParams?.campaign || "cart-checkout";
    const invoiceNumber = generateInvoiceNumber();

    const line_items = cartItems.map((item) => ({
      title: item.product.title,
      price: item.variant.price.toFixed(2),
      quantity: item.quantity,
    }));

    const shopifyPayload = {
      draft_order: {
        line_items,
        use_customer_default_address: true,
        tags: `invoice:${invoiceNumber},utm_source:${utmSource},utm_medium:${utmMedium},utm_campaign:${utmCampaign}`,
      },
    };

    const shop = process.env.SHOPIFY_SHOP;
    const token = process.env.SHOPIFY_ACCESS_TOKEN;
    if (!shop || !token) throw new Error("Missing Shopify credentials"); // Call Shopify API

    const response = await fetch(
      `https://${shop}/admin/api/2024-01/draft_orders.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": token,
        },
        body: JSON.stringify(shopifyPayload),
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = "Failed to create draft order via Shopify API.";
      try {
        const data = JSON.parse(responseText);
        errorMessage = data.error || JSON.stringify(data);
      } catch (_) {
        errorMessage = `API returned non-JSON response (${
          response.status
        }): ${responseText.substring(0, 200)}`;
      }
      logError(new Error(errorMessage), {
        context: "checkoutCartAction - API Error",
        payload: shopifyPayload,
      });
      throw new Error(errorMessage);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      logError(
        parseError instanceof Error ? parseError : new Error("Invalid JSON"),
        { context: "checkoutCartAction - Parse JSON" }
      );
      throw new Error("Failed to parse Shopify API response");
    }

    const invoiceUrl = responseData?.draft_order?.invoice_url;
    if (!invoiceUrl) throw new Error("No invoice URL returned from Shopify"); // Append UTM & first product info

    const finalUrl = new URL(invoiceUrl);
    finalUrl.searchParams.set("utm_source", utmSource);
    finalUrl.searchParams.set("utm_medium", utmMedium);
    finalUrl.searchParams.set("utm_campaign", utmCampaign);
    finalUrl.searchParams.set("invoice", invoiceNumber);

    const firstItem = cartItems[0];
    if (firstItem) {
      finalUrl.searchParams.set("product_title", firstItem.product.title);
      const firstImage =
        firstItem.product.variants?.[0]?.featured_image ||
        firstItem.product.images?.[0]?.src;
      if (firstImage && /^https?:\/\//i.test(firstImage)) {
        finalUrl.searchParams.set("product_image", firstImage);
      }
    }

    return finalUrl.toString();
  } catch (error) {
    logError(error instanceof Error ? error : new Error("Unknown error"), {
      context: "checkoutCartAction",
      itemCount: cartItems?.length || 0,
    });
    throw new Error(
      error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR
    );
  }
}
