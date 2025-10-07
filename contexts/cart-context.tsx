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
	action: CartAction,
): ClientCartState => {
	switch (action.type) {
		case "ADD_ITEM": {
			const { product, variant, quantity } = action.payload;
			const existingItemIndex = state.items.findIndex(
				(item) =>
					item.product.id === product.id && item.variant?.id === variant.id,
			);

			if (existingItemIndex > -1) {
				const updatedItems = [...state.items];
				updatedItems[existingItemIndex].quantity += quantity;
				return { ...state, items: updatedItems };
			}

			const newItem: ClientCartItem = {
				id: `${product.id}-${variant.id}`,
				product,
				variant,
				quantity,
				name: product.title,
				price: variant.price,
				image: variant.featured_image || product.images[0]?.src,
			};

			return { ...state, items: [...state.items, newItem] };
		}

		case "REMOVE_ITEM": {
			const { productId, variantId } = action.payload;
			const filteredItems = state.items.filter(
				(item) =>
					!(item.product.id === productId && item.variant?.id === variantId),
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
					: item,
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

function createDefaultVariant(product: ApiProduct): ApiProductVariant {
	const firstVariant = product.variants?.[0];
	return {
		id: firstVariant?.id || product.id,
		product_id: product.id,
		title: firstVariant?.title || "Default Title",
		price: product.price,
		sku: firstVariant?.sku || "",
		grams: firstVariant?.grams || 0,
		featured_image: product.images?.[0]?.src,
		available: product.in_stock,
		requires_shipping: firstVariant?.requires_shipping ?? true,
		taxable: firstVariant?.taxable ?? true,
		compare_at_price: product.compare_at_price,
		position: 1,

		created_at: product.created_at,
		updated_at: product.updated_at,
	};
}

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
			const savedCart = localStorage.getItem("jhuangnyc-cart");
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: "LOAD_CART", payload: cartItems });
        } catch (e) {
          console.error("Error loading cart from localStorage:", e);
          localStorage.removeItem("jhuangnyc-cart");
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
						const variant =
							product.variants?.find((v) => v.id === item.variant_id) ||
							createDefaultVariant(product);

						return {
							id: item.id,
							product,
							variant,
							quantity: item.quantity,
							name: product.title,
							price: variant.price,
							image: variant.featured_image || product.images[0]?.src,
						};
					}),
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
			localStorage.setItem("jhuangnyc-cart", JSON.stringify(state.items));
		}
	}, [state.items, user]);

	const addItem = async (
		product: ApiProduct,
		selectedVariant?: ApiProductVariant,
		quantity: number = 1,
	) => {
		const variant = selectedVariant || createDefaultVariant(product);

		dispatch({
			type: "ADD_ITEM",
			payload: { product, variant, quantity },
		});

		toast.success(`${product.title} added to cart`);

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
					variant_id: variant.id,
					quantity,
				}),
			});
			if (!res.ok) throw new Error("Failed to add item");
		} catch (err) {
			console.error("Error adding item to cart:", err);
			toast.error("Failed to sync cart. Please try again.");
			dispatch({
				type: "REMOVE_ITEM",
				payload: { productId: product.id, variantId: variant.id },
			});
		}
	};

	const removeItem = async (productId: string, variantId: string) => {
		const itemToRemove = state.items.find(
			(item) => item.product.id === productId && item.variant.id === variantId,
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
			toast.error("Failed to remove item. Please try again.");
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
		quantity: number,
	) => {
		const itemToUpdate = state.items.find(
			(item) => item.product.id === productId && item.variant.id === variantId,
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
			toast.error("Failed to update quantity. Please try again.");
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
			return total + item.variant.price * item.quantity;
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
