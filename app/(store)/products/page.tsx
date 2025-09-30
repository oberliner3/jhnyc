"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/product/product-card";
import { getAllProducts } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { ApiProduct } from "@/lib/types";

function ProductsList() {
	const [products, setProducts] = useState<ApiProduct[]>([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	useEffect(() => {
		getAllProducts({ limit: 24, page: 1 }).then((initialProducts) => {
			setProducts(initialProducts);
			if (initialProducts.length < 24) {
				setHasMore(false);
			}
		});
	}, []);

	const loadMore = async () => {
		const nextPage = page + 1;
		const newProducts = await getAllProducts({ limit: 24, page: nextPage });
		if (newProducts.length > 0) {
			setProducts((prevProducts) => [...prevProducts, ...newProducts]);
			setPage(nextPage);
		} else {
			setHasMore(false);
		}
	};

	return (
		<div>
			<div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>
			{hasMore && (
				<div className="mt-8 text-center">
					<Button onClick={loadMore}>Load More</Button>
				</div>
			)}
		</div>
	);
}

export default function ProductsPage() {
	return (
		<div className="px-4 py-8 container">
			<div className="mb-8">
				<h1 className="mb-4 font-bold text-3xl lg:text-4xl tracking-tight">
					All Products
				</h1>
				<p className="text-muted-foreground">
					Discover our complete collection of premium products
				</p>
			</div>

			<ProductsList />
		</div>
	);
}
