"use client";

import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BuyNowButton } from "@/components/product/buy-now-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";

import type { ApiProduct } from "@/lib/types";
import { formatPrice, stripHtml } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useProductVariants } from "@/hooks/use-product-variants";

interface ProductCardProps {
  product: ApiProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { selectedVariant, setSelectedVariant } = useProductVariants(product);
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const discountPercentage = product.compare_at_price
    ? Math.round(
        ((product.compare_at_price - product.price) /
          product.compare_at_price) *
          100
      )
    : 0;

  const hasVariants = product.variants && product.variants.length > 1;
  const hasMultipleImages = product.images && product.images.length > 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, selectedVariant, 1);
  };

  const currentImage =
    product.images && product.images.length > 0
      ? product.images[currentImageIndex].src
      : "/og.png";

  const shortDescription = stripHtml(product.body_html || "").slice(0, 100);

  return (
    <article
      className="group relative bg-card hover:shadow-xl border rounded-lg overflow-hidden text-card-foreground transition-all duration-300 flex flex-col"
      onMouseEnter={() => hasMultipleImages && setCurrentImageIndex(1)}
      onMouseLeave={() => hasMultipleImages && setCurrentImageIndex(0)}
    >
      <header className="relative">
        <Link href={`/products/${product.handle}`} className="block">
          <div className="relative bg-gray-100 aspect-square overflow-hidden">
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
          </div>
        </Link>
      </header>

      <div className="p-4 space-y-3 flex-grow">
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
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">
            {formatPrice(selectedVariant?.price || product.price)}
          </span>
          {product.compare_at_price && (
            <span className="text-muted-foreground text-sm line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>

      <footer className="p-4 pt-0 space-y-3">
        {hasVariants && (
          <div>
            <Select
              onValueChange={(value) => {
                const variant = product.variants?.find((v) => v.id === value);
                setSelectedVariant(variant);
              }}
              defaultValue={selectedVariant?.id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a variant" />
              </SelectTrigger>
              <SelectContent>
                {product.variants?.map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex gap-2">
          <BuyNowButton
            product={product}
            variant={selectedVariant}
            quantity={1}
            style="minimal"
            size="sm"
            className="flex-1"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </footer>
    </article>
  );
}
