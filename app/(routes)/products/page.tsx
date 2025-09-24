// biome-ignore assist/source/organizeImports: <>
import { ProductCard } from "@/components/product/product-card";
import { FEATURED_PRODUCTS } from "@/lib/data/products";
import { generateSEO } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEO({
	title: "Products",
	description:
		"Browse our complete collection of premium products. Find everything you need from electronics to fashion and lifestyle items.",
	path: "/products",
});

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

			<div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{FEATURED_PRODUCTS.concat(FEATURED_PRODUCTS).map((product, index) => (
					<ProductCard key={`${product.id}-${index}`} product={product} />
				))}
			</div>
		</div>
	);
}
