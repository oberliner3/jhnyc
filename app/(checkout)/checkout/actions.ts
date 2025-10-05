"use server";

import { redirect } from "next/navigation";
import { getOrCreateAnonymousCart } from "@/lib/anonymous-cart";
import type { Address } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { env } from "@/lib/env-validation";
import { logger } from "@/lib/utils/logger";

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
  address: Address;
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

    const { id: anonymousCartId } = await getOrCreateAnonymousCart(sessionId);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User is not authenticated" };
    }

    const userId = user.id;

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
          address: data.customer.address.address1,
          city: data.customer.address.city,
          state: data.customer.address.province || "",
          postal_code: data.customer.address.zip || "",
          country: data.customer.address.country,
          phone: data.customer.phone || "",
        },
        billing_address: {
          name: `${data.customer.firstName} ${data.customer.lastName}`,
          address: data.customer.address.address1,
          city: data.customer.address.city,
          state: data.customer.address.province || "",
          postal_code: data.customer.address.zip || "",
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
                  address1: data.customer.address.address1,
                  city: data.customer.address.city,
                  zip: data.customer.address.zip || "",
                  province: data.customer.address.province || "",
                  country: data.customer.address.country,
                  phone: data.customer.phone || "",
                },
              ],
            },
            shipping_address: {
              first_name: data.customer.firstName,
              last_name: data.customer.lastName,
              address1: data.customer.address.address1,
              city: data.customer.address.city,
              zip: data.customer.address.zip || "",
              province: data.customer.address.province || "",
              country: data.customer.address.country,
              phone: data.customer.phone || "",
            },
            billing_address: {
              first_name: data.customer.firstName,
              last_name: data.customer.lastName,
              address1: data.customer.address.address1,
              city: data.customer.address.city,
              zip: data.customer.address.zip || "",
              province: data.customer.address.province || "",
              country: data.customer.address.country,
              phone: data.customer.phone || "",
            },
            use_customer_default_address: false,
            note: `Order #${order.id}`,
          },
        };

        // Call the draft order API endpoint
        const response = await fetch(
          `${env.NEXT_PUBLIC_SITE_URL}/api/draft-orders`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lineItems: shopifyData.draft_order.line_items.map((item) => ({
                title: item.title,
                variantId: item.variant_id,
                productId: item.product_id,
                quantity: item.quantity,
                price: item.price?.toString(),
              })),
              customerEmail: shopifyData.draft_order.customer?.email,
              customerFirstName: shopifyData.draft_order.customer?.first_name,
              customerLastName: shopifyData.draft_order.customer?.last_name,
              customerPhone: shopifyData.draft_order.customer?.phone,
              shippingAddress: shopifyData.draft_order.shipping_address,
              billingAddress: shopifyData.draft_order.billing_address,
              note: shopifyData.draft_order.note,
              tags: shopifyData.draft_order.tags,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Draft order API returned ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.draftOrder?.invoiceUrl) {
          redirect(result.draftOrder.invoiceUrl);
        }
      } catch (shopifyError) {
        logger.error("Shopify integration error", shopifyError);
      }
    }

    return {
      success: true,
      orderId: order.id,
      message: "Order created successfully",
    };
  } catch (error) {
    logger.error("Checkout error", error);
    return {
      success: false,
      error: "An unexpected error occurred during checkout",
    };
  }
}
