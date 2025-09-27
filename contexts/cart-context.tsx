'use client'

import type React from 'react'
import { createContext, useContext, useEffect, useReducer, useState, useCallback } from 'react'
import type { CartItem as ApiCartItem, Product, ProductVariant } from '@/lib/types'
import { useAuth } from './auth-context'
import { mapApiToProduct } from '@/lib/api'

// --- State Management ---

export interface ClientCartItem {
  id: string; // This is the API cart_item ID
  product: Product;
  variant: ProductVariant;
  quantity: number;
  name: string;
  price: number;
  image?: string;
}

export interface ClientCartState {
  items: ClientCartItem[];
  isOpen: boolean;
}

interface CartContextType extends ClientCartState {
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
  | { type: 'LOAD_CART'; payload: ClientCartItem[] }

const CartContext = createContext<CartContextType | undefined>(undefined)

const cartReducer = (state: ClientCartState, action: CartAction): ClientCartState => {
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

      const newItem: ClientCartItem = {
        id: `${product.id}-${variant.id}`, // Temporary ID for client-side
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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
  const { user } = useAuth();
  const [cartId, setCartId] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    if (!user) {
      const savedCart = localStorage.getItem('originz-cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: cartItems });
        } catch (e) {
          console.error('Error loading cart from localStorage:', e);
          localStorage.removeItem('originz-cart');
        }
      }
      return;
    }

    try {
      const res = await fetch('/api/cart');
      if (!res.ok) throw new Error("Failed to fetch cart");
      let cartData = await res.json();

      if (!cartData || !cartData.id) {
        const createRes = await fetch('/api/cart', { method: 'POST' });
        if (!createRes.ok) throw new Error("Failed to create cart");
        cartData = await createRes.json();
      }
      setCartId(cartData.id);

      if (cartData.cart_items && cartData.cart_items.length > 0) {
        const itemsWithDetails = await Promise.all(cartData.cart_items.map(async (item: ApiCartItem) => {
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
      } else {
        dispatch({ type: 'LOAD_CART', payload: [] });
      }
    } catch (err) {
      console.error('Error loading cart from API:', err);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('originz-cart', JSON.stringify(state.items));
    }
  }, [state.items, user]);

  const addItem = async (product: Product, variant: ProductVariant, quantity: number = 1) => {
    if (!user || !cartId) {
      dispatch({ type: 'ADD_ITEM', payload: { product, variant, quantity } });
      return;
    }
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: cartId, product_id: product.id, variant_id: variant.id, quantity }),
      });
      if (!res.ok) throw new Error('Failed to add item');
      await loadCart();
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
      const itemToRemove = state.items.find(item => item.product.id === productId && item.variant.id === variantId);
      if (!itemToRemove) return;

      const res = await fetch('/api/cart/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: cartId, item_id: itemToRemove.id }),
      });
      if (!res.ok) throw new Error('Failed to remove item');
      await loadCart();
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
      await removeItem(productId, variantId);
      return;
    }
    try {
      const itemToUpdate = state.items.find(item => item.product.id === productId && item.variant.id === variantId);
      if (!itemToUpdate) return;

      const res = await fetch('/api/cart/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: cartId, item_id: itemToUpdate.id, quantity }),
      });
      if (!res.ok) throw new Error('Failed to update quantity');
      await loadCart();
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
      const res = await fetch('/api/cart/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: cartId }),
      });
      if (!res.ok) throw new Error('Failed to clear cart');
      await loadCart();
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
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
