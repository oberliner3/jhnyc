import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { FeaturedProductsSkeleton } from "@/components/skeletons/featured-products-skeleton";
import { Button } from "@/components/ui/button";
import { getCollectionByHandle } from "@/lib/data/products";

async function FeaturedProductsList() {
	const apiProducts = await getCollectionByHandle("featured", {
		limit: 8,
	});
	const products = apiProducts;

	return (
		<div className="grid gap-6 grid-cols-2 md:grid-cols-4">
			{products.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</div>
	);
}

export function FeaturedProducts() {
	return (
		<section className="py-16 lg:py-24">
			<div className="px-4 container">
				<div className="flex justify-between items-center mb-12">
					<div className="space-y-2">
						<h2 className="font-bold text-3xl lg:text-4xl tracking-tight">
							Featured Products
						</h2>
						<p className="text-muted-foreground">
							Discover our most popular and trending items
						</p>
					</div>
					<Button variant="outline" asChild>
						<Link href="/collections/all">
							View All
							<ArrowRight className="ml-2 w-4 h-4" />
						</Link>
					</Button>
				</div>

				<Suspense fallback={<FeaturedProductsSkeleton />}>
					<FeaturedProductsList />
				</Suspense>
			</div>
		</section>
	);
}
