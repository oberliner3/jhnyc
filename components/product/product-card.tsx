'use client'

import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/lib/types";
import { useCart } from "@/contexts/cart-context";
import { getImageProxyUrl } from "@/lib/api";

interface ProductCardProps {
	product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

	const discountPercentage = product.compareAtPrice
		? Math.round(
				((product.compareAtPrice - product.price) / product.compareAtPrice) *
					100,
			)
		: 0;

  const hasVariants = product.variants && product.variants.length > 0;

  const handleAddToCart = () => {
    if (!product.inStock) return;

    if (!hasVariants && product.variants && product.variants.length > 0) {
      addItem(product, product.variants[0], 1);
    }
  };

	return (
		<div className="group relative bg-card hover:shadow-lg border rounded-lg overflow-hidden text-card-foreground transition-all">
			{/* Product Image */}
			<Link href={`/products/${product.handle}`} className="block">
				<div className="relative aspect-square overflow-hidden">
					<Image
						src={getImageProxyUrl(product.images[0].src)}
						alt={product.name}
						fill
						className="object-cover group-hover:scale-105 transition-transform"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
					/>
					{discountPercentage > 0 && (
						<Badge variant="destructive" className="top-2 left-2 z-10 absolute">
							-{discountPercentage}%
						</Badge>
					)}
					{!product.inStock && (
						<div className="absolute inset-0 flex justify-center items-center bg-black/50">
							<Badge variant="secondary">Out of Stock</Badge>
						</div>
					)}
				</div>
			</Link>

			{/* Product Info */}
			<div className="space-y-3 p-4">
				<div className="space-y-1">
					<h3 className="font-semibold group-hover:text-primary line-clamp-2 transition-colors">
						<Link href={`/products/${product.handle}`}>{product.name}</Link>
					</h3>
					<p className="text-muted-foreground text-sm line-clamp-2">
						{product.body_html}
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
					<span className="text-muted-foreground text-sm">
						({product.reviewCount})
					</span>
				</div>

				{/* Price */}
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<span className="font-bold text-lg">
							{formatPrice(product.price)}
						</span>
						{product.compareAtPrice && (
							<span className="text-muted-foreground text-sm line-through">
								{formatPrice(product.compareAtPrice)}
							</span>
						)}
					</div>
          <Button
            size="sm"
            variant="outline"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={!product.inStock}
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
