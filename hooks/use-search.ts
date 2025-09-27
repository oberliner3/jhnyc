"use client";

import react from "react";
import type { ApiProduct } from "@/lib/types";

export function useSearch(products: ApiProduct[]) {
  const [query, setQuery] = react.useState("");
  const [filters, setFilters] = react.useState({
    category: "",
    minPrice: 180,
    maxPrice: 10_000,
    in_stock: false,
  });

  const filteredProducts = react.useMemo(() => {
    return products.filter((product) => {
      const matchesQuery =
        query === "" ||
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.body_html.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase())
        );

      const matchesCategory =
        filters.category === "" || product.category === filters.category;
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
