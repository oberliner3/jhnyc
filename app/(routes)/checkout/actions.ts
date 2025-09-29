"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { processCheckoutData } from "@/lib/worker";
import { createShopifyDraftOrder } from "@/lib/shopify-api";

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
  address: string;
  city: string;
  postalCode: string;
  country: string;
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

export async function handleCheckout(data: CheckoutData) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "Pending",
        total: data.totals.total,
        shipping_address: {
          name: `${data.customer.firstName} ${data.customer.lastName}`,
          address: data.customer.address,
          city: data.customer.city,
          postal_code: data.customer.postalCode,
          country: data.customer.country,
          phone: data.customer.phone,
        },
        billing_address: {
          name: `${data.customer.firstName} ${data.customer.lastName}`,
          address: data.customer.address,
          city: data.customer.city,
          postal_code: data.customer.postalCode,
          country: data.customer.country,
          phone: data.customer.phone,
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
    const { error: cartError } = await supabase
      .from("cart_items")
      .delete()
      .eq(
        "cart_id",
        (
          await supabase
            .from("carts")
            .select("id")
            .eq("user_id", user.id)
            .single()
        ).data?.id
      );

    if (cartError) {
      console.error("Cart clearing error:", cartError);
      // Don't fail the order for cart clearing issues
    }

    // If Shopify integration is enabled, create draft order
    if (process.env.SHOPIFY_SHOP && process.env.SHOPIFY_TOKEN) {
      try {
        // Process the checkout data using the worker
        const processedData = processCheckoutData(data);

        // Create Shopify draft order
        const draftOrder = await createShopifyDraftOrder(processedData);

        if (draftOrder?.invoice_url) {
          // Redirect to Shopify checkout
          redirect(draftOrder.invoice_url);
        }
      } catch (shopifyError) {
        console.error("Shopify integration error:", shopifyError);
        // Continue with regular checkout if Shopify fails
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
