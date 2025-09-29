"use server";

import { redirect } from "next/navigation";
import type { ApiProduct } from "@/lib/types";

/**
 * Handles a campaign "buy now" request on the server.
 * It creates a Shopify draft order and then redirects the user to the checkout URL.
 * This is a Server Action.
 *
 * Note: Reads Shopify shop and token from environment variables for safety.
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
) {
  const shop = process.env.NEXT_PUBLIC_SHOPIFY_SHOP;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_TOKEN;
  if (!shop || !token) {
    throw new Error("Shopify configuration missing");
  }

  const invoiceNumber = `Invoice${Math.floor(
    1000000 + Math.random() * 9000000
  )}`;
  const data = {
    draft_order: {
      line_items: [
        {
          title: invoiceNumber,
          price: product.price.toFixed(2),
          quantity: product.quantity,
        },
      ],
      use_customer_default_address: true,
    },
  };

  const response = await fetch(
    `https://${shop}/admin/api/2024-01/draft_orders.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Shopify API Error:", errorBody);
    throw new Error(
      `Failed to create Shopify draft order: ${response.statusText}`
    );
  }

  const responseData = await response.json();
  const invoiceUrl = responseData.draft_order?.invoice_url;

  if (!invoiceUrl) {
    throw new Error("Shopify response did not include an invoice URL.");
  }

  const redirectUrl = new URL(invoiceUrl);

  // Append tracking parameters to the final checkout URL
  Object.entries(tracking).forEach(([key, value]) => {
    if (value) {
      redirectUrl.searchParams.set(key, value);
    }
  });

  redirect(redirectUrl.toString());
}

/**
 * Server Action suitable for use as a <form action={buyNowAction}> handler.
 * Expects FormData fields matching the Buy Now button's hidden inputs.
 */
export async function buyNowAction(formData: FormData) {
  const shop = process.env.NEXT_PUBLIC_SHOPIFY_SHOP;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_TOKEN;
  if (!shop || !token) {
    throw new Error("Shopify configuration missing");
  }

  const productId = String(formData.get("productId") || "");
  const variantId = String(formData.get("variantId") || "");
  const price = Number(formData.get("price"));
  const quantity = Number(formData.get("quantity"));
  const productTitle = String(formData.get("productTitle") || "");
  const productImage = String(formData.get("productImage") || "");

  if (!productId || !variantId || !Number.isFinite(price) || !Number.isFinite(quantity) || quantity < 1) {
    throw new Error("Missing or invalid required fields");
  }

  const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const draftOrderData = {
    draft_order: {
      line_items: [
        {
          title: productTitle || invoiceNumber,
          price: price.toFixed(2),
          quantity: quantity,
        },
      ],
      note: `Product: ${productTitle}, Variant: ${variantId}`,
      use_customer_default_address: true,
    },
  };

  const response = await fetch(
    `https://${shop}/admin/api/2024-01/draft_orders.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(draftOrderData),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Shopify API Error:", errorBody);
    throw new Error("Failed to create draft order");
  }

  const responseData = await response.json();
  const invoiceUrl = responseData.draft_order?.invoice_url;
  if (!invoiceUrl) {
    throw new Error("No invoice URL returned");
  }

  const finalUrl = new URL(invoiceUrl);
  finalUrl.searchParams.set("product_title", productTitle || "");
  finalUrl.searchParams.set("product_image", productImage || "");

  redirect(finalUrl.toString());
}
