"use client";

import { ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { getImageProxyUrl } from "@/lib/api";
import type { ApiProduct } from "@/lib/types";
import { formatPrice, stripHtml } from "@/lib/utils";

interface ProductCardProps {
	product: ApiProduct;
}

export function ProductCard({ product }: ProductCardProps) {
	const { addItem } = useCart();

	const discountPercentage = product.compare_at_price
		? Math.round(
				((product.compare_at_price - product.price) /
					product.compare_at_price) *
					100,
			)
		: 0;

	const hasVariants = product.variants && product.variants.length > 0;

	const handleAddToCart = () => {
		if (!product.in_stock) return;

		if (!hasVariants && product.variants && product.variants.length > 0) {
			addItem(product, product.variants[0], 1);
		}
	};

	const imageUrl =
		product.images && product.images.length > 0
			? getImageProxyUrl(product.images[0].src)
			: "/og.png";

	return (
		<div className="group relative bg-card hover:shadow-lg border rounded-lg overflow-hidden text-card-foreground transition-all">
			{/* Product Image */}
			<Link href={`/products/${product.handle}`} className="block">
				<div className="relative aspect-square overflow-hidden">
					<Image
						src={imageUrl}
						alt={product.title}
						fill
						unoptimized
						className="object-cover group-hover:scale-105 transition-transform"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
					/>
					{discountPercentage > 0 && (
						<Badge variant="destructive" className="top-2 left-2 z-10 absolute">
							-{discountPercentage}%
						</Badge>
					)}
				</div>
			</Link>

			{/* Product Info */}
			<div className="space-y-3 p-4">
				<div className="space-y-1">
					<h3 className="font-semibold group-hover:text-primary line-clamp-2 transition-colors">
						<Link href={`/products/${product.handle}`}>{product.title}</Link>
					</h3>
					<p className="text-muted-foreground text-sm line-clamp-2">
						{stripHtml(product.body_html)}
					</p>
				</div>

				{/* Rating */}
				<div className="flex items-center gap-1">
					<div className="flex">
						{[...Array(5)].map((_, i) => (
							<Star
								key={`star-${product.id}-${i}`}
								className={`h-4 w-4 ${
									i < Math.floor(product.rating)
										? "fill-yellow-400 text-yellow-400"
										: "text-muted-foreground/30"
								}`}
							/>
						))}
					</div>
					{/* <span className="text-muted-foreground text-sm">
						({product.review_count})
					</span> */}
				</div>

				{/* Price */}
				<div className="flex justify-between items-center">
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
					<Button
						size="sm"
						variant="outline"
						className="opacity-0 group-hover:opacity-100 transition-opacity"
						disabled={!product.in_stock}
						onClick={handleAddToCart}
						asChild={hasVariants}
					>
						{hasVariants ? (
							<Link href={`/products/${product.handle}`}>
								<ShoppingCart className="w-4 h-4" />
							</Link>
						) : (
							<ShoppingCart className="w-4 h-4" />
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
