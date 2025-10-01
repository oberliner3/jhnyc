"use client";

import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BuyNowButton } from "@/components/product/buy-now-button";
import { useCart } from "@/contexts/cart-context";

import type {
	ApiProduct,
	ApiProductOption,
	ApiProductVariant,
} from "@/lib/types";
import { formatPrice, stripHtml } from "@/lib/utils";

interface ProductCardProps {
	product: ApiProduct & {
		variants?: ApiProductVariant[];
		options?: ApiProductOption[];
	};
}

export function ProductCard({ product }: ProductCardProps) {
	const { addItem } = useCart();
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	const discountPercentage = product.compare_at_price
		? Math.round(
				((product.compare_at_price - product.price) /
					product.compare_at_price) *
					100,
			)
		: 0;

	// const hasVariants = product.variants && product.variants.length > 0;
	const hasMultipleImages = product.images && product.images.length > 1;

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		// Allow adding out-of-stock items and handle variants in cart-context
		addItem(product, product.variants?.[0], 1);
	};


	const currentImage =
		product.images && product.images.length > 0
			? product.images[currentImageIndex].src
			: "/og.png";

	const shortDescription = stripHtml(product.body_html || "").slice(0, 100);

	return (
		<div
			className="group relative bg-card hover:shadow-xl border rounded-lg overflow-hidden text-card-foreground transition-all duration-300"
			onMouseEnter={() => hasMultipleImages && setCurrentImageIndex(1)}
			onMouseLeave={() => hasMultipleImages && setCurrentImageIndex(0)}
		>
			{/* Product Image */}
			<Link href={`/products/${product.handle}`} className="block">
				<div className="relative aspect-square overflow-hidden bg-gray-100">
					<Image
						src={currentImage}
						alt={product.title}
						fill
						className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
						priority={false}
						loading="lazy"
					/>
					{discountPercentage > 0 && (
						<Badge variant="destructive" className="top-2 left-2 z-10 absolute">
							-{discountPercentage}%
						</Badge>
					)}
					{!product.in_stock && (
						<div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
							<Badge variant="secondary" className="bg-white text-black">
								Out of Stock
							</Badge>
						</div>
					)}

					{/* Quick Actions Overlay */}
					<div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						<div className="flex gap-2">
							<BuyNowButton
								product={product}
								variant={product.variants?.[0]}
								quantity={1}
								style="minimal"
								size="sm"
								className="flex-1 bg-white/90 hover:bg-white text-black border-none"
							/>
							<Button
								size="sm"
								variant="secondary"
								onClick={handleAddToCart}
								disabled={!product.in_stock}
							>
								<ShoppingCart className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			</Link>

			{/* Product Info */}
			<div className="space-y-3 p-4">
				<div className="space-y-1">
					<h3 className="font-semibold group-hover:text-primary line-clamp-1 transition-colors">
						<Link href={`/products/${product.handle}`}>{product.title}</Link>
					</h3>
					{shortDescription && (
						<p className="text-muted-foreground text-sm line-clamp-2">
							{shortDescription}...
						</p>
					)}
				</div>

				{/* Price and Actions */}
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<span className="font-bold text-lg">
							{formatPrice(product.price)}
						</span>
						{product.compare_at_price && (
							<span className="text-muted-foreground text-sm line-through">
								{formatPrice(product.compare_at_price)}
							</span>
						)}
					</div>

					{/* Desktop: Hidden buttons that appear on hover */}
					<div className="hidden md:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						<BuyNowButton
							product={product}
							variant={product.variants?.[0]}
							quantity={1}
							style="minimal"
							size="sm"
							className="flex-1"
						/>
						<Button
							size="sm"
							variant="outline"
							onClick={handleAddToCart}
							disabled={!product.in_stock}
						>
							<ShoppingCart className="w-4 h-4" />
						</Button>
					</div>

					{/* Mobile: Always visible buttons */}
					<div className="flex md:hidden gap-2">
						<Button size="sm" variant="default" className="flex-1" asChild>
							<Link href={`/products/${product.handle}`}>View Details</Link>
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={handleAddToCart}
							disabled={!product.in_stock}
						>
							<ShoppingCart className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
