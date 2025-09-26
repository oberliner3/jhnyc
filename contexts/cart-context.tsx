'use client'

import type React from 'react'
import { createContext, useContext, useEffect, useReducer } from 'react'
import type { CartItem, CartState, Product, ProductVariant } from '@/lib/types'

interface CartContextType extends CartState {
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => Promise<void>
  removeItem: (productId: string, variantId: string) => Promise<void>
  updateQuantity: (productId: string, variantId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  toggleCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; variant: ProductVariant; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; variantId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; variantId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }

const CartContext = createContext<CartContextType | undefined>(undefined)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, variant, quantity } = action.payload
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === product.id && item.variant?.id === variant.id
      )

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex].quantity += quantity
        return { ...state, items: updatedItems }
      }

      const newItem: CartItem = {
        id: `${product.id}-${variant.id}`,
        product,
        variant,
        quantity,
        name: product.title,
        price: variant.price,
        image: variant.image || product.images[0]?.src,
      };

      return { ...state, items: [...state.items, newItem] }
    }

    case 'REMOVE_ITEM': {
      const { productId, variantId } = action.payload
      const filteredItems = state.items.filter(
        (item) => !(item.product.id === productId && item.variant?.id === variantId)
      )
      return { ...state, items: filteredItems }
    }

    case 'UPDATE_QUANTITY': {
      const { productId, variantId, quantity } = action.payload
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { productId, variantId } })
      }

      const updatedItems = state.items.map((item) =>
        item.product.id === productId && item.variant?.id === variantId
          ? { ...item, quantity }
          : item
      )
      return { ...state, items: updatedItems }
    }

    case 'CLEAR_CART':
      return { ...state, items: [] }

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }

    case 'LOAD_CART':
      return { ...state, items: action.payload }

    default:
      return state
  }
}

import { createClient } from '@/utils/supabase/client';
import { useAuth } from './auth-context';
import { mapApiToProduct } from '@/lib/api';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
  const supabase = createClient();
  const { user } = useAuth();
  const [cartId, setCartId] = useState<string | null>(null);

  // Load cart from API or create a new one
  useEffect(() => {
    async function loadCart() {
      if (!user) {
        // For unauthenticated users, load from localStorage
        const savedCart = localStorage.getItem('originz-cart');
        if (savedCart) {
          try {
            const cartItems = JSON.parse(savedCart);
            dispatch({ type: 'LOAD_CART', payload: cartItems });
          } catch (error) {
            console.error('Error loading cart from localStorage:', error);
          }
        }
        return;
      }

      // For authenticated users, load from DB
      try {
        const res = await fetch('/api/cart');
        if (!res.ok) {
          throw new Error("Failed to fetch cart");
        }
        let cartData = await res.json();

        if (!cartData) {
          // If no cart exists, create one
          const createRes = await fetch('/api/cart', {
            method: 'POST',
          });
          if (!createRes.ok) {
            throw new Error("Failed to create cart");
          }
          cartData = await createRes.json();
        }
        setCartId(cartData.id);

        // Fetch product details for each cart item
        const itemsWithDetails = await Promise.all(cartData.cart_items.map(async (item: any) => {
          const productRes = await fetch(`/api/products/${item.product_id}`);
          const productData = await productRes.json();
          const product = mapApiToProduct(productData);

          const variant = product.variants.find((v) => v.id === item.variant_id);

          return {
            id: item.id,
            product,
            variant: variant || product.variants[0],
            quantity: item.quantity,
            name: product.title,
            price: variant?.price || product.price,
            image: variant?.image || product.images[0]?.src,
          };
        }));

        dispatch({ type: 'LOAD_CART', payload: itemsWithDetails });
      } catch (err) {
        console.error('Error loading cart from API:', err);
        setError((err as Error).message);
      }
    }
    loadCart();
  }, [user]);

  // Save cart to localStorage for unauthenticated users
  useEffect(() => {
    if (!user) {
      localStorage.setItem('originz-cart', JSON.stringify(state.items));
    }
  }, [state.items, user]);

  const addItem = async (product: Product, variant: ProductVariant, quantity: number = 1) => {
    if (!user || !cartId) {
      // Fallback to local storage for unauthenticated users
      dispatch({ type: 'ADD_ITEM', payload: { product, variant, quantity } });
      return;
    }

    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: cartId, product_id: product.id, variant_id: variant.id, quantity }),
      });
      if (!res.ok) throw new Error("Failed to add item to cart");
      // After adding, refetch cart to update state
      // This is a simplified approach; a more optimized solution would update local state directly
      // and then sync with API in background.
      loadCart(); // Re-load cart to get updated items with details
    } catch (err) {
      console.error('Error adding item to cart:', err);
    }
  };

  const removeItem = async (productId: string, variantId: string) => {
    if (!user || !cartId) {
      dispatch({ type: 'REMOVE_ITEM', payload: { productId, variantId } });
      return;
    }

    try {
      const res = await fetch('/api/cart/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: cartId, product_id: productId, variant_id: variantId }),
      });
      if (!res.ok) throw new Error("Failed to remove item from cart");
      loadCart(); // Re-load cart to get updated items
    } catch (err) {
      console.error('Error removing item from cart:', err);
    }
  };

  const updateQuantity = async (productId: string, variantId: string, quantity: number) => {
    if (!user || !cartId) {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, variantId, quantity } });
      return;
    }

    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }

    try {
      const res = await fetch('/api/cart/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: cartId, product_id: productId, variant_id: variantId, quantity }),
      });
      if (!res.ok) throw new Error("Failed to update item quantity");
      loadCart(); // Re-load cart to get updated items
    } catch (err) {
      console.error('Error updating item quantity:', err);
    }
  };

  const clearCart = async () => {
    if (!user || !cartId) {
      dispatch({ type: 'CLEAR_CART' });
      return;
    }

    try {
      // This would ideally be a dedicated API endpoint to clear all items for a cart_id
      // For now, we'll iterate and delete, or implement a new API route.
      // For simplicity, let's assume a new API route /api/cart/clear
      const res = await fetch('/api/cart/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: cartId }),
      });
      if (!res.ok) throw new Error("Failed to clear cart");
      loadCart(); // Re-load cart to get updated items
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
      const price = item.variant ? item.variant.price : 0
      return total + price * item.quantity
    }, 0)
  }

  const value: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    getTotalItems,
    getTotalPrice,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
