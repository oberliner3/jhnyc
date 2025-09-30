import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { CollectionSkeleton } from "@/components/skeletons/collection-skeleton";
import { getAllProducts } from "@/lib/api";
import { generateSEO } from "@/lib/seo";
import type { ApiProduct } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

interface CollectionPageProps {
	params: Promise<{ slug: string }>;
	searchParams?: Promise<{
		page?: string;
	}>;
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
	const { slug } = await params;

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

async function CollectionProducts({
	slug,
	page = 1,
}: {
	slug: string;
	page: number;
}) {
	let products: ApiProduct[] = [];
	const productsPerPage = 20;
	let hasNextPage = false;
	let totalProducts = 0;

	try {
		// For "all" collection, use pagination directly
		if (slug === "all") {
			products = await getAllProducts({ limit: productsPerPage, page });
			// Fetch one more product to check if there's a next page
			const nextPageProducts = await getAllProducts({
				limit: 1,
				page: page + 1,
			});
			hasNextPage = nextPageProducts.length > 0;
		} else {
			// For other collections, fetch all and filter (can be optimized with backend support)
			const allProducts = await getAllProducts({ limit: 100 });
			let filteredProducts = allProducts;

			// Filter products based on collection type
			switch (slug) {
				case "sale":
					filteredProducts = allProducts.filter(
						(p) => p.compare_at_price && p.compare_at_price > p.price,
					);
					break;
				case "new":
					// Filter products created in the last 30 days (mock logic)
					filteredProducts = allProducts.slice(0, 24);
					break;
				case "featured":
					// Filter products with high ratings
					filteredProducts = allProducts.filter(
						(p) => p.rating && p.rating >= 4,
					);
					break;
				case "bestsellers":
					// Filter products with high review counts
					filteredProducts = allProducts.filter(
						(p) => p.review_count && p.review_count >= 10,
					);
					break;
				case "trending":
					// Mock trending products (could be based on views, sales, etc.)
					filteredProducts = allProducts.slice(0, 20);
					break;
			}

			totalProducts = filteredProducts.length;
			const startIndex = (page - 1) * productsPerPage;
			const endIndex = startIndex + productsPerPage;
			products = filteredProducts.slice(startIndex, endIndex);
			hasNextPage = endIndex < totalProducts;
		}
	} catch (error) {
		console.error("Error fetching collection products:", error);
		products = [];
	}

	return (
		<>
			{products.length > 0 ? (
				<>
					<div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{products.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</div>

					{/* Pagination */}
					<div className="flex justify-center items-center gap-4 mt-12">
						{page > 1 && (
							<Link href={`/collections/${slug}?page=${page - 1}`}>
								<Button variant="outline" size="sm">
									<ChevronLeft className="w-4 h-4 mr-1" />
									Previous
								</Button>
							</Link>
						)}

						<span className="text-sm text-gray-600">Page {page}</span>

						{hasNextPage && (
							<Link href={`/collections/${slug}?page=${page + 1}`}>
								<Button variant="outline" size="sm">
									Next
									<ChevronRight className="w-4 h-4 ml-1" />
								</Button>
							</Link>
						)}
					</div>
				</>
			) : (
				<div className="text-center py-12">
					<p className="text-gray-600">No products found in this collection.</p>
				</div>
			)}
		</>
	);
}

export default async function CollectionPage({
	params,
	searchParams,
}: CollectionPageProps) {
	const { slug } = await params;
	const resolvedSearchParams = await searchParams;
	const page = Number(resolvedSearchParams?.page) || 1;

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
					<CollectionProducts slug={slug} page={page} />
				</Suspense>
			</div>
		</div>
	);
}
