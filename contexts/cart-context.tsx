"use client";

import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useReducer,
	useState,
} from "react";
import type {
	ShoppingCartItem as ApiCartItem,
	ApiProduct,
	ApiProductVariant,
	CartContextType,
	ClientCartItem,
	ClientCartState,
} from "@/lib/types";
import { useAuth } from "./auth-context";
import { toast } from "sonner";

export type CartAction =
	| {
			type: "ADD_ITEM";
			payload: {
				product: ApiProduct;
				variant: ApiProductVariant;
				quantity: number;
			};
	  }
	| { type: "REMOVE_ITEM"; payload: { productId: string; variantId: string } }
	| {
			type: "UPDATE_QUANTITY";
			payload: { productId: string; variantId: string; quantity: number };
	  }
	| { type: "CLEAR_CART" }
	| { type: "TOGGLE_CART" }
	| { type: "LOAD_CART"; payload: ClientCartItem[] };

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (
  state: ClientCartState,
  action: CartAction
): ClientCartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, variant, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.product.id === product.id && item.variant?.id === variant.id
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += quantity;
        return { ...state, items: updatedItems };
      }

      const newItem: ClientCartItem = {
        id: `${product.id}-${variant?.id || product.id}`, // Use product ID if variant ID is missing
        product,
        variant,
        quantity,
        name: product.title,
        price: variant?.price || product.price, // Use product price if variant price is missing
        image: variant?.featured_image || product.images[0]?.src,
      };

      return { ...state, items: [...state.items, newItem] };
    }

    case "REMOVE_ITEM": {
      const { productId, variantId } = action.payload;
      const filteredItems = state.items.filter(
        (item) =>
          !(item.product.id === productId && item.variant?.id === variantId)
      );
      return { ...state, items: filteredItems };
    }

    case "UPDATE_QUANTITY": {
      const { productId, variantId, quantity } = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, {
          type: "REMOVE_ITEM",
          payload: { productId, variantId },
        });
      }

      const updatedItems = state.items.map((item) =>
        item.product.id === productId && item.variant?.id === variantId
          ? { ...item, quantity }
          : item
      );
      return { ...state, items: updatedItems };
    }

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };

    case "LOAD_CART":
      return { ...state, items: action.payload };

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });
  const { user } = useAuth();
  const [cartId, setCartId] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    if (!user) {
      const savedCart = localStorage.getItem("originz-cart");
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: "LOAD_CART", payload: cartItems });
        } catch (e) {
          console.error("Error loading cart from localStorage:", e);
          localStorage.removeItem("originz-cart");
        }
      }
      return;
    }

    try {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      let cartData = await res.json();

      if (!cartData || !cartData.id) {
        const createRes = await fetch("/api/cart", { method: "POST" });
        if (!createRes.ok) throw new Error("Failed to create cart");
        cartData = await createRes.json();
      }
      setCartId(cartData.id);

      if (cartData.cart_items && cartData.cart_items.length > 0) {
        const itemsWithDetails = await Promise.all(
          cartData.cart_items.map(async (item: ApiCartItem) => {
            const product = item.product;
            const variant = product.variants?.find(
              (v) => v.id === item.variant_id
            );

            // If no variant is found or product has no variants, create a default variant from the product
            const finalVariant = variant ||
              product.variants?.[0] || {
                id: product.id, // Use product ID as variant ID if no variants
                title: product.title, // Default title
                price: product.price, // Use product price
                sku: product.variants[0].sku, // Use product SKU
                grams: product.variants[0].grams, // Use product grams
                featured_image: product.images?.[0]?.src, // Use product's first image
                available: product.in_stock, // Use product's in_stock status
                option1: null,
                option2: null,
                option3: null,
              };

            return {
              id: item.id,
              product,
              variant: finalVariant,
              quantity: item.quantity,
              name: product.title,
              price: finalVariant?.price || product.price,
              image: finalVariant?.featured_image || product.images[0]?.src,
            };
          })
        );
        dispatch({ type: "LOAD_CART", payload: itemsWithDetails });
      } else {
        dispatch({ type: "LOAD_CART", payload: [] });
      }
    } catch (err) {
      console.error("Error loading cart from API:", err);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem("originz-cart", JSON.stringify(state.items));
    }
  }, [state.items, user]);

  const addItem = async (
    product: ApiProduct,
    selectedVariant?: ApiProductVariant, // Make selectedVariant optional
    quantity: number = 1
  ) => {
    // Determine the variant to use. If no selectedVariant, try to use the first available variant,
    // or construct a default one from the product itself.
    // Determine the variant to use.
    // If no selectedVariant, try to use the first available variant.
    // If no variants at all, the variant_id sent to backend will be null.
    const variantToSend = selectedVariant || product.variants?.[0];

    // For client-side state, we still need a full variant object for display purposes.
    // If no actual variant, create a synthetic one based on the product.
    const clientSideVariant = variantToSend || {
      id: product.id, // Use product ID as variant ID for client-side if no actual variant
      title: "Default Title",
      price: product.price,
      sku: product.variants[0].sku,
      grams: product.variants[0].grams,
      featured_image: product.images?.[0]?.src,
      available: product.in_stock,
      option1: null,
      option2: null,
      option3: null,
    };

    dispatch({
      type: "ADD_ITEM",
      payload: { product, variant: clientSideVariant, quantity },
    });

    if (!user || !cartId) {
      return;
    }

    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_id: cartId,
          product_id: product.id,
          variant_id: variantToSend?.id || null, // Send null if no actual variant
          quantity,
        }),
      });
      if (!res.ok) throw new Error("Failed to add item");
    } catch (err) {
      console.error("Error adding item to cart:", err);
      toast.error("Failed to add item to cart. Please try again.");
      // Rollback
      dispatch({
        type: "REMOVE_ITEM",
        payload: { productId: product.id, variantId: variantToSend.id },
      });
    }
  };

  const removeItem = async (productId: string, variantId: string) => {
    const itemToRemove = state.items.find(
      (item) => item.product.id === productId && item.variant.id === variantId
    );
    if (!itemToRemove) return;

    dispatch({ type: "REMOVE_ITEM", payload: { productId, variantId } });

    if (!user || !cartId) {
      return;
    }

    try {
      const res = await fetch("/api/cart/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_id: cartId, item_id: itemToRemove.id }),
      });
      if (!res.ok) throw new Error("Failed to remove item");
    } catch (err) {
      console.error("Error removing item from cart:", err);
      toast.error("Failed to remove item from cart. Please try again.");
      // Rollback
      dispatch({
        type: "ADD_ITEM",
        payload: {
          product: itemToRemove.product,
          variant: itemToRemove.variant,
          quantity: itemToRemove.quantity,
        },
      });
    }
  };

  const updateQuantity = async (
    productId: string,
    variantId: string,
    quantity: number
  ) => {
    const itemToUpdate = state.items.find(
      (item) => item.product.id === productId && item.variant.id === variantId
    );
    if (!itemToUpdate) return;

    const originalQuantity = itemToUpdate.quantity;
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { productId, variantId, quantity },
    });

    if (!user || !cartId) {
      return;
    }

    if (quantity <= 0) {
      await removeItem(productId, variantId);
      return;
    }

    try {
      const res = await fetch("/api/cart/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_id: cartId,
          item_id: itemToUpdate.id,
          quantity,
        }),
      });
      if (!res.ok) throw new Error("Failed to update quantity");
    } catch (err) {
      console.error("Error updating item quantity:", err);
      toast.error("Failed to update item quantity. Please try again.");
      // Rollback
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { productId, variantId, quantity: originalQuantity },
      });
    }
  };

  const clearCart = async () => {
    const currentItems = state.items;
    dispatch({ type: "CLEAR_CART" });

    if (!user || !cartId) {
      return;
    }

    try {
      const res = await fetch("/api/cart/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_id: cartId }),
      });
      if (!res.ok) throw new Error("Failed to clear cart");
    } catch (err) {
      console.error("Error clearing cart:", err);
      toast.error("Failed to clear cart. Please try again.");
      // Rollback
      dispatch({ type: "LOAD_CART", payload: currentItems });
    }
  };

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
      const price = item.variant ? item.variant.price : 0;
      return total + price * item.quantity;
    }, 0);
  };

  const value: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    getTotalItems,
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
};
