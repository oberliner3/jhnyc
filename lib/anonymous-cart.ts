/**
 * Anonymous Cart Management System
 * Handles guest user carts stored in Supabase for remarketing
 */

import { createClient } from "@/utils/supabase/client";
import { generateShortId } from "@/lib/utils/uuid";
import type { ApiProduct, ApiProductVariant } from "./types";

export interface AnonymousCartItem {
  id?: string;
  product_id: string;
  variant_id?: string;
  product_title: string;
  product_image?: string;
  price: number;
  quantity: number;
  added_at?: string;
  updated_at?: string;
}

export interface AnonymousCart {
  id?: string;
  session_id: string;
  expires_at: string;
  email?: string;
  phone?: string;
  cart_data: Record<string, unknown>;
  total_value: number;
  item_count: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  status: 'active' | 'abandoned' | 'converted' | 'expired';
  items?: AnonymousCartItem[];
}

export interface CartContext {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
}

/**
 * Generate a unique session ID for anonymous users
 */
export function generateSessionId(): string {
  return `anon_${generateShortId()}`;
}

/**
 * Get or create session ID from localStorage
 */
export function getSessionId(): string {
  if (typeof window === "undefined") {
    return generateSessionId();
  }

  let sessionId = localStorage.getItem("anonymous_session_id");
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem("anonymous_session_id", sessionId);
  }
  return sessionId;
}

/**
 * Get cart context from browser environment
 */
export function getCartContext(): CartContext {
  if (typeof window === "undefined") {
    return {};
  }

  const urlParams = new URLSearchParams(window.location.search);
  
  return {
    utm_source: urlParams.get("utm_source") || undefined,
    utm_medium: urlParams.get("utm_medium") || undefined,
    utm_campaign: urlParams.get("utm_campaign") || undefined,
    referrer: document.referrer || undefined,
    user_agent: navigator.userAgent,
    // IP address would be set server-side
  };
}

/**
 * Create or get existing anonymous cart
 */
export async function getOrCreateAnonymousCart(
  sessionId: string = getSessionId(),
  context: CartContext = getCartContext()
): Promise<AnonymousCart> {
  const supabase = createClient();

  // Try to get existing active cart
  const { data: initialCart, error } = await supabase
    .from("anonymous_carts")
    .select(`
      *,
      items:anonymous_cart_items(*)
    `)
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching anonymous cart:", error);
    throw error;
  }

  // Create new cart if none exists
  let cart = initialCart;
  if (!cart) {
    const newCart = {
      session_id: sessionId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      cart_data: {},
      total_value: 0,
      item_count: 0,
      status: "active" as const,
      ...context,
    };

    const { data: createdCart, error: createError } = await supabase
      .from("anonymous_carts")
      .insert(newCart)
      .select(`
        *,
        items:anonymous_cart_items(*)
      `)
      .single();

    if (createError) {
      console.error("Error creating anonymous cart:", createError);
      throw createError;
    }

    cart = createdCart;
  }

  return cart as AnonymousCart;
}

/**
 * Add item to anonymous cart
 */
export async function addToAnonymousCart(
  product: ApiProduct,
  variant?: ApiProductVariant,
  quantity: number = 1
): Promise<AnonymousCart> {
  const supabase = createClient();
  const sessionId = getSessionId();
  
  // Get or create cart
  const cart = await getOrCreateAnonymousCart(sessionId);

  const cartItem: Omit<AnonymousCartItem, "id" | "added_at" | "updated_at"> = {
    product_id: product.id,
    variant_id: variant?.id,
    product_title: product.title,
    product_image: product.images?.[0]?.src,
    price: variant?.price || product.price,
    quantity,
  };

  // Check if item already exists
  const { data: existingItem } = await supabase
    .from("anonymous_cart_items")
    .select("*")
    .eq("cart_id", cart.id!)
    .eq("product_id", product.id)
    .eq("variant_id", variant?.id || "")
    .single();

  if (existingItem) {
    // Update quantity
    const { error } = await supabase
      .from("anonymous_cart_items")
      .update({ quantity: existingItem.quantity + quantity })
      .eq("id", existingItem.id);

    if (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  } else {
    // Add new item
    const { error } = await supabase
      .from("anonymous_cart_items")
      .insert({ ...cartItem, cart_id: cart.id });

    if (error) {
      console.error("Error adding cart item:", error);
      throw error;
    }
  }

  // Return updated cart
  return getOrCreateAnonymousCart(sessionId);
}

/**
 * Update item quantity in anonymous cart
 */
export async function updateAnonymousCartItem(
  itemId: string,
  quantity: number
): Promise<AnonymousCart> {
  const supabase = createClient();
  const sessionId = getSessionId();

  if (quantity <= 0) {
    // Remove item
    const { error } = await supabase
      .from("anonymous_cart_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("Error removing cart item:", error);
      throw error;
    }
  } else {
    // Update quantity
    const { error } = await supabase
      .from("anonymous_cart_items")
      .update({ quantity })
      .eq("id", itemId);

    if (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  }

  // Return updated cart
  return getOrCreateAnonymousCart(sessionId);
}

/**
 * Remove item from anonymous cart
 */
export async function removeFromAnonymousCart(itemId: string): Promise<AnonymousCart> {
  return updateAnonymousCartItem(itemId, 0);
}

/**
 * Clear anonymous cart
 */
export async function clearAnonymousCart(): Promise<void> {
  const supabase = createClient();
  const sessionId = getSessionId();

  // First get the cart ID(s)
  const { data: carts, error: cartError } = await supabase
    .from("anonymous_carts")
    .select("id")
    .eq("session_id", sessionId);

  if (cartError) {
    console.error("Error finding anonymous cart:", cartError);
    throw cartError;
  }

  if (carts && carts.length > 0) {
    const cartIds = carts.map(cart => cart.id);
    
    const { error } = await supabase
      .from("anonymous_cart_items")
      .delete()
      .in("cart_id", cartIds);

    if (error) {
      console.error("Error clearing anonymous cart items:", error);
      throw error;
    }
  }
}

/**
 * Update cart with customer info (for remarketing)
 */
export async function updateAnonymousCartCustomer(
  email?: string,
  phone?: string
): Promise<AnonymousCart> {
  const supabase = createClient();
  const sessionId = getSessionId();

  const { error } = await supabase
    .from("anonymous_carts")
    .update({ email, phone })
    .eq("session_id", sessionId)
    .eq("status", "active");

  if (error) {
    console.error("Error updating cart customer info:", error);
    throw error;
  }

  return getOrCreateAnonymousCart(sessionId);
}

/**
 * Mark cart as abandoned (for remarketing campaigns)
 */
export async function markCartAsAbandoned(sessionId: string = getSessionId()): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("anonymous_carts")
    .update({ status: "abandoned" })
    .eq("session_id", sessionId)
    .eq("status", "active");

  if (error) {
    console.error("Error marking cart as abandoned:", error);
    throw error;
  }
}

/**
 * Mark cart as converted (after successful checkout)
 */
export async function markCartAsConverted(sessionId: string = getSessionId()): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("anonymous_carts")
    .update({ status: "converted" })
    .eq("session_id", sessionId);

  if (error) {
    console.error("Error marking cart as converted:", error);
    throw error;
  }
}

/**
 * Get cart summary for analytics
 */
export async function getCartSummary(sessionId: string = getSessionId()): Promise<{
  totalValue: number;
  itemCount: number;
  items: AnonymousCartItem[];
} | null> {
  const cart = await getOrCreateAnonymousCart(sessionId);
  
  return {
    totalValue: cart.total_value,
    itemCount: cart.item_count,
    items: cart.items || [],
  };
}

/**
 * Migrate anonymous cart to authenticated user (when user logs in)
 */
export async function migrateAnonymousCartToUser(
  userId: string,
  sessionId: string = getSessionId()
): Promise<void> {
  // This would integrate with your existing authenticated cart system
  // For now, we'll just mark the anonymous cart as converted
  await markCartAsConverted(sessionId);
  
  // Clear the session ID from localStorage since user is now authenticated
  if (typeof window !== "undefined") {
    localStorage.removeItem("anonymous_session_id");
  }
}
