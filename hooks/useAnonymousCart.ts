/**
 * React Hook for Anonymous Cart Management
 * Provides cart state and operations for guest users
 */

import { useState, useEffect, useCallback } from "react";
import {
  getOrCreateAnonymousCart,
  addToAnonymousCart,
  updateAnonymousCartItem,
  removeFromAnonymousCart,
  clearAnonymousCart,
  updateAnonymousCartCustomer,
  markCartAsAbandoned,
  markCartAsConverted,
  getSessionId,
  type AnonymousCart,
} from "@/lib/anonymous-cart";
import type { ApiProduct, ApiProductVariant } from "@/lib/types";

interface UseAnonymousCartReturn {
  cart: AnonymousCart | null;
  loading: boolean;
  error: string | null;
  
  // Cart operations
  addItem: (product: ApiProduct, variant?: ApiProductVariant, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Customer info for remarketing
  updateCustomerInfo: (email?: string, phone?: string) => Promise<void>;
  
  // Cart status operations
  markAbandoned: () => Promise<void>;
  markConverted: () => Promise<void>;
  
  // Utility
  refreshCart: () => Promise<void>;
  sessionId: string;
  
  // Analytics
  getTotalValue: () => number;
  getItemCount: () => number;
  isEmpty: boolean;
}

export function useAnonymousCart(): UseAnonymousCartReturn {
  const [cart, setCart] = useState<AnonymousCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => getSessionId());

  const initializeCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const initialCart = await getOrCreateAnonymousCart(sessionId);
      setCart(initialCart);
    } catch (err) {
      console.error("Failed to initialize anonymous cart:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize cart");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Initialize cart on mount
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);



  const refreshCart = useCallback(async () => {
    try {
      setError(null);
      const updatedCart = await getOrCreateAnonymousCart(sessionId);
      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to refresh cart:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh cart");
    }
  }, [sessionId]);

  const addItem = useCallback(async (
    product: ApiProduct,
    variant?: ApiProductVariant,
    quantity: number = 1
  ) => {
    try {
      setError(null);
      const updatedCart = await addToAnonymousCart(product, variant, quantity);
      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to add item to cart:", err);
      setError(err instanceof Error ? err.message : "Failed to add item");
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    try {
      setError(null);
      const updatedCart = await updateAnonymousCartItem(itemId, quantity);
      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to update cart item:", err);
      setError(err instanceof Error ? err.message : "Failed to update item");
      throw err;
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      setError(null);
      const updatedCart = await removeFromAnonymousCart(itemId);
      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to remove cart item:", err);
      setError(err instanceof Error ? err.message : "Failed to remove item");
      throw err;
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setError(null);
      await clearAnonymousCart();
      await refreshCart();
    } catch (err) {
      console.error("Failed to clear cart:", err);
      setError(err instanceof Error ? err.message : "Failed to clear cart");
      throw err;
    }
  }, [refreshCart]);

  const updateCustomerInfo = useCallback(async (email?: string, phone?: string) => {
    try {
      setError(null);
      const updatedCart = await updateAnonymousCartCustomer(email, phone);
      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to update customer info:", err);
      setError(err instanceof Error ? err.message : "Failed to update customer info");
      throw err;
    }
  }, []);

  const markAbandoned = useCallback(async () => {
    try {
      setError(null);
      await markCartAsAbandoned(sessionId);
      await refreshCart();
    } catch (err) {
      console.error("Failed to mark cart as abandoned:", err);
      setError(err instanceof Error ? err.message : "Failed to mark cart as abandoned");
      throw err;
    }
  }, [sessionId, refreshCart]);

  // Auto-save cart state on visibility change (for abandonment tracking)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && cart && cart.items && cart.items.length > 0) {
        // User is leaving the page with items in cart - potential abandonment
        setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            markAbandoned().catch(console.error);
          }
        }, 30000); // Wait 30 seconds before marking as abandoned
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [cart, markAbandoned]);

  const markConverted = useCallback(async () => {
    try {
      setError(null);
      await markCartAsConverted(sessionId);
      await refreshCart();
    } catch (err) {
      console.error("Failed to mark cart as converted:", err);
      setError(err instanceof Error ? err.message : "Failed to mark cart as converted");
      throw err;
    }
  }, [sessionId, refreshCart]);

  const getTotalValue = useCallback(() => {
    return cart?.total_value || 0;
  }, [cart]);

  const getItemCount = useCallback(() => {
    return cart?.item_count || 0;
  }, [cart]);

  const isEmpty = cart ? (cart.items?.length || 0) === 0 : true;

  return {
    cart,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    updateCustomerInfo,
    markAbandoned,
    markConverted,
    refreshCart,
    sessionId,
    getTotalValue,
    getItemCount,
    isEmpty,
  };
}

// Hook for cart analytics (for admin/marketing use)
export function useAnonymousCartAnalytics(startDate?: Date, endDate?: Date) {
  const [analytics, setAnalytics] = useState<{
    totalCarts: number;
    activeCarts: number;
    abandonedCarts: number;
    convertedCarts: number;
    avgCartValue: number;
    avgItemsPerCart: number;
    conversionRate: number;
    abandonmentRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the Supabase function via API
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate.toISOString());
      if (endDate) params.append('end_date', endDate.toISOString());

      const response = await fetch(`/api/analytics/carts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cart analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to fetch cart analytics:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}