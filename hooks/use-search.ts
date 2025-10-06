"use client";

import react from "react";
import type { ApiProduct } from "@/lib/types";
import { normalizeProductTags } from "@/lib/utils";

export function useSearch(products: ApiProduct[]) {
	const [query, setQuery] = react.useState("");
	const [filters, setFilters] = react.useState({
		category: "",
		minPrice: 180,
		maxPrice: 100_000,
		in_stock: false,
	});

	const filteredProducts = react.useMemo(() => {
		return products.filter((product) => {
      // Safely normalize tags to array format
      const productTags = normalizeProductTags(product.tags);

      const matchesQuery =
        query === "" ||
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.body_html.toLowerCase().includes(query.toLowerCase()) ||
        productTags.some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase())
        );

      const matchesCategory =
        filters.category === "" || product.product_type === filters.category;
      const matchesPrice =
        product.price >= filters.minPrice && product.price <= filters.maxPrice;
      const matchesStock = !filters.in_stock || product.in_stock;

      return matchesQuery && matchesCategory && matchesPrice && matchesStock;
    });
	}, [products, query, filters]);

	return {
		query,
		setQuery,
		filters,
		setFilters,
		filteredProducts,
	};
}
