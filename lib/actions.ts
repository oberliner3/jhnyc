'use server';

import { redirect } from 'next/navigation';
import { type ApiProduct } from "@/lib/types";

/**
 * Handles a campaign "buy now" request on the server.
 * It creates a Shopify draft order and then redirects the user to the checkout URL.
 * This is a Server Action.
 *
 * @param shop - The Shopify store domain (e.g., 'your-store.myshopify.com').
 * @param token - The Shopify Admin API access token.
 * @param product - The product details for the draft order.
 * @param tracking - UTM parameters and product details for the final URL.
 */
export async function handleCampaignRedirect(
  shop: string,
  token: string,
  product: Pick<ApiProduct, "price" | "quantity">,
  tracking: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    product_title?: string;
    product_image?: string;
  }
) {
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
