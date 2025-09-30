"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/cart-context";
import type { ClientCartItem } from "@/lib/types";

export function QuantityInput({ item }: { item: ClientCartItem }) {
	const { updateQuantity } = useCart();
	const [quantity, setQuantity] = useState(item.quantity);

	useEffect(() => {
		const handler = setTimeout(() => {
			if (quantity !== item.quantity) {
				updateQuantity(item.product.id, item.variant.id, quantity);
			}
		}, 500);
		return () => clearTimeout(handler);
	}, [
		quantity,
		item.quantity,
		item.product.id,
		item.variant.id,
		updateQuantity,
	]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value, 10);
		if (value > 0) {
			setQuantity(value);
		} else {
			setQuantity(1);
		}
	};

	return (
		<Input
			type="number"
			value={quantity}
			onChange={handleChange}
			className="w-16 text-center"
			min="1"
		/>
	);
}
