import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, Truck, RefreshCw, Shield } from "lucide-react";
import { generateSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { FEATURED_PRODUCTS } from "@/lib/data/products";

interface ProductPageProps {
	params: { slug: string };
}

export async function generateMetadata({
	params,
}: ProductPageProps): Promise<Metadata> {
	const product = FEATURED_PRODUCTS.find((p) => p.handle === params.slug);

	if (!product) {
		return generateSEO({ title: "Product Not Found" });
	}

	return generateSEO({
		title: product.name,
		description: product.body_html,
		path: `/products/${product.handle}`,
		type: "product",
		image: product.images[0],
	});
}

export default function ProductPage({ params }: ProductPageProps) {
	const product = FEATURED_PRODUCTS.find((p) => p.handle === params.slug);

	if (!product) {
		notFound();
	}

	const discountPercentage = product.compareAtPrice
		? Math.round(
				((product.compareAtPrice - product.price) / product.compareAtPrice) *
					100,
			)
		: 0;

	const productSchema = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.name,
		description: product.body_html,
		image: product.images,
		offers: {
			"@type": "Offer",
			url: `https://originz.vercel.app/products/${product.handle}`,
			priceCurrency: "USD",
			price: product.price,
			availability: product.inStock
				? "https://schema.org/InStock"
				: "https://schema.org/OutOfStock",
		},
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: product.rating,
			reviewCount: product.reviewCount,
		},
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
			/>

			<div className="px-4 py-8 container">
				<div className="gap-8 lg:gap-12 grid lg:grid-cols-2">
					{/* Product Images */}
					<div className="space-y-4">
						<div className="relative bg-muted rounded-lg aspect-square overflow-hidden">
							<Image
								src={product.images[0]}
								alt={product.name}
								fill
								className="object-cover"
								priority
							/>
							{discountPercentage > 0 && (
								<Badge variant="destructive" className="top-4 left-4 absolute">
									-{discountPercentage}%
								</Badge>
							)}
						</div>
						{product.images.length > 1 && (
							<div className="gap-2 grid grid-cols-4">
								{product.images.slice(1, 5).map((image, index) => (
									<div
										key={index}
										className="relative bg-muted rounded-md aspect-square overflow-hidden"
									>
										<Image
											src={image}
											alt={`${product.name} ${index + 2}`}
											fill
											className="object-cover"
										/>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Product Info */}
					<div className="space-y-6">
						<div>
							<Badge variant="secondary" className="mb-2">
								{product.category}
							</Badge>
							<h1 className="font-bold text-3xl lg:text-4xl tracking-tight">
								{product.name}
							</h1>

							{/* Rating */}
							<div className="flex items-center gap-2 mt-2">
								<div className="flex">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className={`h-5 w-5 ${
												i < Math.floor(product.rating)
													? "fill-yellow-400 text-yellow-400"
													: "text-muted-foreground/30"
											}`}
										/>
									))}
								</div>
								<span className="text-muted-foreground text-sm">
									{product.rating} ({product.reviewCount} reviews)
								</span>
							</div>
						</div>

						{/* Price */}
						<div className="space-y-2">
							<div className="flex items-center gap-3">
								<span className="font-bold text-3xl">
									{formatPrice(product.price)}
								</span>
								{product.compareAtPrice && (
									<span className="text-muted-foreground text-lg line-through">
										{formatPrice(product.compareAtPrice)}
									</span>
								)}
							</div>
							{product.compareAtPrice && (
								<p className="text-green-600 text-sm">
									You save {formatPrice(product.compareAtPrice - product.price)}{" "}
									({discountPercentage}%)
								</p>
							)}
						</div>

						{/* Description */}
						<div>
							<h3 className="mb-2 font-semibold">Description</h3>
							<p className="text-muted-foreground">{product.body_html}</p>
						</div>

						{/* Add to Cart */}
						<div className="space-y-4">
							<Button size="lg" className="w-full" disabled={!product.inStock}>
								{product.inStock ? "Add to Cart" : "Out of Stock"}
							</Button>

							{product.inStock && (
								<Button variant="outline" size="lg" className="w-full">
									Buy Now
								</Button>
							)}
						</div>

						<Separator />

						{/* Product Features */}
						<div className="space-y-3">
							<div className="flex items-center gap-3">
								<Truck className="w-5 h-5 text-muted-foreground" />
								<span className="text-sm">
									Free shipping on orders over $50
								</span>
							</div>
							<div className="flex items-center gap-3">
								<RefreshCw className="w-5 h-5 text-muted-foreground" />
								<span className="text-sm">30-day return policy</span>
							</div>
							<div className="flex items-center gap-3">
								<Shield className="w-5 h-5 text-muted-foreground" />
								<span className="text-sm">2-year warranty included</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
