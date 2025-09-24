'use client'

import type React from 'react'
import { createContext, useContext, useEffect, useReducer } from 'react'
import type { CartItem, CartState, Product, ProductVariant } from '@/lib/types'

interface CartContextType extends CartState {
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void
  removeItem: (productId: number, variantId: number) => void
  updateQuantity: (productId: number, variantId: number, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; variant: ProductVariant; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: number; variantId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; variantId: number; quantity: number } }
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
        name: product.name,
        price: variant.price,
        image: variant.image || product.images[0]?.src,
      }

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

// ... (rest of the component)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false })
  const supabase = createClient();

  useEffect(() => {
    const getCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('carts')
          .select('items')
          .eq('user_id', user.id)
          .single();

        if (data) {
          dispatch({ type: 'LOAD_CART', payload: data.items });
        } else {
          const savedCart = localStorage.getItem('originz-cart');
          if (savedCart) {
            try {
              const cartItems = JSON.parse(savedCart);
              dispatch({ type: 'LOAD_CART', payload: cartItems });
            } catch (error) {
              console.error('Error loading cart from localStorage:', error);
            }
          }
        }
      } else {
        const savedCart = localStorage.getItem('originz-cart');
        if (savedCart) {
          try {
            const cartItems = JSON.parse(savedCart);
            dispatch({ type: 'LOAD_CART', payload: cartItems });
          } catch (error) {
            console.error('Error loading cart from localStorage:', error);
          }
        }
      }
    }
    getCart();
  }, [supabase]);

  useEffect(() => {
    const saveCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('carts').upsert({ user_id: user.id, items: state.items });
      } else {
        localStorage.setItem('originz-cart', JSON.stringify(state.items));
      }
    }
    saveCart();
  }, [state.items, supabase]);

  // ... (rest of the component)



  const addItem = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, variant, quantity } })
  }

  const removeItem = (productId: number, variantId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, variantId } })
  }

  const updateQuantity = (productId: number, variantId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, variantId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' })
  }

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