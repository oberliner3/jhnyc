"use client";

import { type ReactNode, createContext, useContext, useState } from "react";
import type { ApiProduct } from "@/lib/types";

interface ProductContextType {
	product: ApiProduct | null;
	setProduct: (product: ApiProduct) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({
	children,
	initialProduct = null,
}: {
	children: ReactNode;
	initialProduct?: ApiProduct | null;
}) {
	const [product, setProduct] = useState<ApiProduct | null>(initialProduct);

	return (
		<ProductContext.Provider value={{ product, setProduct }}>
			{children}
		</ProductContext.Provider>
	);
}

export function useProduct() {
	const context = useContext(ProductContext);
	if (context === undefined) {
		throw new Error("useProduct must be used within a ProductProvider");
	}
	return context;
}
