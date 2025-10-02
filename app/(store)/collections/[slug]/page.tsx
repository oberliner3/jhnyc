import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { CollectionSkeleton } from "@/components/skeletons/collection-skeleton";
import { loadProducts, loadDataOptimized } from "@/lib/msgpack-loader";
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
		console.log(`🔍 Loading collection "${slug}" with ${productsPerPage} products per page, page ${page}`);
		
		// Check if this is a special collection that should use the external API collections endpoint
		const apiCollections = ["featured", "sale", "new", "bestsellers", "trending"];
		
		if (slug === "all") {
			// Use the regular products endpoint with pagination
			products = await loadProducts({ 
				limit: productsPerPage, 
				page,
				context: 'ssr'
			});
			// Fetch one more product to check if there's a next page
			const nextPageProducts = await loadProducts({
				limit: 1,
				page: page + 1,
				context: 'ssr'
			});
			hasNextPage = nextPageProducts.length > 0;
			totalProducts = products.length; // We don't have exact total, use products length
		} else if (apiCollections.includes(slug)) {
			// Use the external API collections endpoint directly
			try {
				const collectionData = await loadDataOptimized<{
					products: ApiProduct[];
					meta?: {
						total: number;
						page: number;
						limit: number;
						total_pages: number;
					};
				}>(`/collections/${slug}?page=${page}&limit=${productsPerPage}`, {
					context: 'ssr'
				});
				
				products = Array.isArray(collectionData.products) ? collectionData.products : [];
				// Force all products to in_stock: true (as per your existing logic)
				products = products.map(p => ({ ...p, in_stock: true }));
				
				// Handle pagination from API meta data
				if (collectionData.meta) {
					totalProducts = collectionData.meta.total;
					hasNextPage = page < collectionData.meta.total_pages;
				} else {
					// Fallback: assume there might be more if we got a full page
					totalProducts = products.length;
					hasNextPage = products.length === productsPerPage;
				}
				
				console.log(`🎆 Collection "${slug}" from API: ${products.length} products, total: ${totalProducts}, hasNext: ${hasNextPage}`);
			} catch (collectionError) {
				console.warn(`⚠️ Collection API failed for "${slug}", falling back to product filtering:`, collectionError);
				
				// Fallback to the old filtering method if collection API fails
				const allProducts = await loadProducts({ 
					limit: 200,
					context: 'ssr'
				});
				
				let filteredProducts = allProducts;
				
				// Apply fallback filtering
				switch (slug) {
					case "sale":
						filteredProducts = allProducts.filter(
							(p) => p.compare_at_price && p.compare_at_price > p.price,
						);
						break;
					case "new":
						filteredProducts = allProducts.slice(0, 24);
						break;
					case "featured":
						const highRatedProducts = allProducts.filter(
							(p) => p.rating && p.rating >= 4,
						);
						filteredProducts = highRatedProducts.length > 0 
							? highRatedProducts 
							: allProducts.slice(0, 24);
						break;
					case "bestsellers":
						const highReviewProducts = allProducts.filter(
							(p) => p.review_count && p.review_count >= 10,
						);
						filteredProducts = highReviewProducts.length > 0 
							? highReviewProducts 
							: allProducts.filter(p => p.review_count && p.review_count > 0).slice(0, 20)
								|| allProducts.slice(0, 20);
						break;
					case "trending":
						filteredProducts = allProducts.slice(0, 20);
						break;
				}
				
				totalProducts = filteredProducts.length;
				const startIndex = (page - 1) * productsPerPage;
				const endIndex = startIndex + productsPerPage;
				products = filteredProducts.slice(startIndex, endIndex);
				hasNextPage = endIndex < totalProducts;
			}
		} else {
			// Unknown collection, try to load as regular products
			products = await loadProducts({ 
				limit: productsPerPage, 
				page,
				context: 'ssr'
			});
			totalProducts = products.length;
			hasNextPage = products.length === productsPerPage;
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
									<ChevronLeft className="mr-1 w-4 h-4" />
									Previous
								</Button>
							</Link>
						)}

						<span className="text-gray-600 text-sm">Page {page}</span>

						{hasNextPage && (
							<Link href={`/collections/${slug}?page=${page + 1}`}>
								<Button variant="outline" size="sm">
									Next
									<ChevronRight className="ml-1 w-4 h-4" />
								</Button>
							</Link>
						)}
					</div>
				</>
			) : (
				<div className="py-12 text-center">
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
		<div className="bg-gray-50 pt-2 min-h-screen">
			{/* Collection Header */}
			<div className="bg-white border-b">
				<div className="container">
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

						<div className="flex items-center gap-1 md:gap-4">
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
			<div className="mt-2 p-0 container">
				<Suspense fallback={<CollectionSkeleton />}>
					<CollectionProducts slug={slug} page={page} />
				</Suspense>
			</div>
		</div>
	);
}
