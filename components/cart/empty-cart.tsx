"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { useEffect, useState } from "react";

import type { ApiProduct } from "@/lib/types";

/**
 * Fetch products from API route
 */
async function fetchProducts(limit: number = 8): Promise<ApiProduct[]> {
  const response = await fetch(`/api/products?page=1&limit=${limit}`);
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.products || [];
}

export function EmptyCart() {
	const [featuredProducts, setFeaturedProducts] = useState<ApiProduct[]>([]);

	useEffect(() => {
		fetchProducts(8)
      .then(setFeaturedProducts)
      .catch((error) => {
        console.error("Error loading featured products:", error);
      });
	}, []);

	return (
		<div className="py-12 text-center">
			<ShoppingCart className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
			<h2 className="mb-2 font-semibold text-2xl">Your cart is empty</h2>
			<p className="mb-6 text-muted-foreground">
				Add some items to your cart to get started.
			</p>
			<Button asChild>
				<Link href="/collections/all">Continue Shopping</Link>
			</Button>

			{featuredProducts.length > 0 && (
				<div className="mt-16">
					<h3 className="mb-8 font-semibold text-xl">You might also like</h3>
					<div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
						{featuredProducts.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}
