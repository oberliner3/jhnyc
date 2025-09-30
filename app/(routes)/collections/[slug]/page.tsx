import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { CollectionSkeleton } from "@/components/skeletons/collection-skeleton";
import { getAllProducts } from "@/lib/api";
import { generateSEO } from "@/lib/seo";
import type { ApiProduct } from "@/lib/types";

export const revalidate = 60;

interface CollectionPageProps {
	params: { slug: string };
}

export async function generateStaticParams() {
	const collections = [
		"all",
		"featured",
		"sale",
		"new",
		"bestsellers",
		"trending",
	];

	return collections.map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: CollectionPageProps): Promise<Metadata> {
	const { slug } = params;

	const collectionNames: Record<string, string> = {
		all: "All Products",
		featured: "Featured Products",
		sale: "Sale Items",
		new: "New Arrivals",
		bestsellers: "Bestsellers",
		trending: "Trending Now",
	};

	const title =
		collectionNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);

	return generateSEO({
		title,
		description: `Browse our ${title.toLowerCase()} collection. Discover amazing products at great prices.`,
		path: `/collections/${slug}`,
	});
}

async function CollectionProducts({ slug }: { slug: string }) {
	let products: ApiProduct[] = [];

	try {
		const allProducts = await getAllProducts({ limit: 48 });

		// Filter products based on collection type
		switch (slug) {
			case "sale":
				products = allProducts.filter(
					(p) => p.compare_at_price && p.compare_at_price > p.price,
				);
				break;
			case "new":
				// Filter products created in the last 30 days (mock logic)
				products = allProducts.slice(0, 12);
				break;
			case "featured":
				// Filter products with high ratings
				products = allProducts.filter((p) => p.rating && p.rating >= 4);
				break;
			case "bestsellers":
				// Filter products with high review counts
				products = allProducts.filter(
					(p) => p.review_count && p.review_count >= 10,
				);
				break;
			case "trending":
				// Mock trending products (could be based on views, sales, etc.)
				products = allProducts.slice(0, 16);
				break;
			default:
				products = allProducts;
		}
	} catch (error) {
		console.error("Error fetching collection products:", error);
		products = [];
	}

	return (
		<div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{products.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</div>
	);
}

export default function CollectionPage({ params }: CollectionPageProps) {
	const { slug } = params;

	const collectionNames: Record<string, string> = {
		all: "All Products",
		featured: "Featured Products",
		sale: "Sale Items",
		new: "New Arrivals",
		bestsellers: "Bestsellers",
		trending: "Trending Now",
	};

	const title =
		collectionNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
	const description = `Discover our curated collection of ${title.toLowerCase()}. Find the perfect items for your needs.`;

	return (
		<div className="bg-gray-50 min-h-screen">
			{/* Collection Header */}
			<div className="bg-white border-b">
				<div className="px-4 py-12 container">
					<div className="text-center">
						<h1 className="mb-4 font-bold text-gray-900 text-4xl tracking-tight">
							{title}
						</h1>
						<p className="mx-auto max-w-2xl text-gray-600 text-lg">
							{description}
						</p>
					</div>
				</div>
			</div>

			{/* Collection Filters */}
			<div className="bg-white border-b">
				<div className="px-4 py-4 container">
					<div className="flex flex-wrap justify-between items-center gap-4">
						<div className="flex items-center gap-4">
							<span className="text-gray-600 text-sm">Filter by:</span>
							<div className="flex space-x-2">
								{["All", "Price", "Rating", "Brand"].map((filter) => (
									<button
										type="button"
										key={filter}
										className="hover:bg-gray-50 px-3 py-1 border border-gray-300 rounded-full text-sm transition-colors"
									>
										{filter}
									</button>
								))}
							</div>
						</div>

						<div className="flex items-center gap-4">
							<span className="text-gray-600 text-sm">Sort by:</span>
							<select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
								<option>Featured</option>
								<option>Price: Low to High</option>
								<option>Price: High to Low</option>
								<option>Newest</option>
								<option>Rating</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Products Grid */}
			<div className="px-4 py-8 container">
				<Suspense fallback={<CollectionSkeleton />}>
					<CollectionProducts slug={slug} />
				</Suspense>
			</div>
		</div>
	);
}
