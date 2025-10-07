"use client";

import { Loader2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useEffect, useRef } from "react";
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
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const priceRef = useRef<HTMLSpanElement>(null);

  const discountPercentage = product.compare_at_price
    ? Math.round(
        ((product.compare_at_price - product.price) /
          product.compare_at_price) *
          100
      )
    : 0;

  const hasVariants = product.variants && product.variants.length > 1;
  const hasMultipleImages = product.images && product.images.length > 1;
  const isOutOfStock = !product.in_stock;
  const isVariantUnavailable =
    hasVariants && selectedVariant && !selectedVariant.available;
  const isDisabled =
    isOutOfStock || isVariantUnavailable || (hasVariants && !selectedVariant);

  // Track price changes for accessibility announcement
  const currentPrice = selectedVariant?.price || product.price;
  useEffect(() => {
    if (previousPrice !== null && previousPrice !== currentPrice) {
      // Price changed, the aria-live region will announce it
      if (priceRef.current) {
        priceRef.current.classList.add("price-updated");
        setTimeout(() => {
          priceRef.current?.classList.remove("price-updated");
        }, 600);
      }
    }
    setPreviousPrice(currentPrice);
  }, [currentPrice, previousPrice]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDisabled || isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await addItem(product, selectedVariant, 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const currentImage =
    product.images && product.images.length > 0
      ? product.images[currentImageIndex].src
      : "/og.png";

  const currentImageAlt =
    product.images?.[currentImageIndex]?.alt ||
    `${product.title}${
      selectedVariant?.title && selectedVariant.title !== "Default Title"
        ? ` - ${selectedVariant.title}`
        : ""
    }`;

  const fullDescription = stripHtml(product.body_html || "");
  const shortDescription = fullDescription.slice(0, 100);
  const isDescriptionTruncated = fullDescription.length > 100;

  // Keyboard navigation for image gallery
  const handleImageNavigation = useCallback(
    (direction: "next" | "prev") => {
      if (!hasMultipleImages) return;

      setCurrentImageIndex((prev) => {
        if (direction === "next") {
          return prev < product.images.length - 1 ? prev + 1 : 0;
        } else {
          return prev > 0 ? prev - 1 : product.images.length - 1;
        }
      });
    },
    [hasMultipleImages, product.images?.length]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!hasMultipleImages) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleImageNavigation("next");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleImageNavigation("prev");
      }
    },
    [hasMultipleImages, handleImageNavigation]
  );

  // Get disabled reason for better UX
  const getDisabledReason = () => {
    if (isOutOfStock) return "This product is currently out of stock";
    if (isVariantUnavailable) return "This variant is currently unavailable";
    if (hasVariants && !selectedVariant) return "Please select a variant";
    return undefined;
  };

  const disabledReason = getDisabledReason();

  return (
    <article
      className="group relative bg-card hover:shadow-xl border rounded-lg overflow-hidden text-card-foreground transition-all duration-300 flex flex-col focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      onMouseEnter={() => hasMultipleImages && setCurrentImageIndex(1)}
      onMouseLeave={() => hasMultipleImages && setCurrentImageIndex(0)}
      aria-label={`${product.title} product card`}
      itemScope
      itemType="https://schema.org/Product"
    >
      <meta itemProp="name" content={product.title} />
      <meta
        itemProp="sku"
        content={
          selectedVariant?.sku || product.variants?.[0]?.sku || product.id
        }
      />
      <meta itemProp="category" content={product.product_type} />
      <meta itemProp="brand" content={product.vendor} />
      <meta
        itemProp="description"
        content={
          g ? `${shortDescription}...` : shortDescription
        }
      />
      {/* Product Image Header */}
      <header className="relative">
        <Link
          href={`/products/${product.handle}`}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`View details for ${product.title}`}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div
            className="relative bg-gray-100 aspect-square overflow-hidden"
            role="img"
            aria-label={currentImageAlt}
          >
            <Image
              src={currentImage}
              alt={currentImageAlt}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority={false}
              loading="lazy"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
              {discountPercentage > 0 && (
                <Badge
                  variant="destructive"
                  aria-label={`${discountPercentage}% discount`}
                >
                  <span aria-hidden="true">-{discountPercentage}%</span>
                  <span className="sr-only">
                    {discountPercentage} percent off
                  </span>
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="secondary" aria-label="Out of stock">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Image navigation indicator */}
            {hasMultipleImages && (
              <div
                className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1"
                aria-hidden="true"
              >
                {product.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-white w-4"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>

        {hasMultipleImages && (
          <span className="sr-only">
            Use arrow keys to navigate through {product.images.length} product
            images. Currently showing image {currentImageIndex + 1} of{" "}
            {product.images.length}.
          </span>
        )}
      </header>

      {/* Product Information */}
      <div className="p-4 space-y-3 flex-grow">
        <div className="space-y-1">
          <h3 className="font-semibold text-base group-hover:text-primary line-clamp-1 transition-colors">
            <Link
              href={`/products/${product.handle}`}
              className="focus:outline-none focus-visible:underline"
              itemProp="name"
            >
              {product.title}
            </Link>
          </h3>
          {shortDescription && (
            <p
              className="text-muted-foreground text-sm line-clamp-2"
              itemProp="description"
            >
              {shortDescription}
              {isDescriptionTruncated ? "..." : ""}
            </p>
          )}
        </div>

        {/* Price with aria-live for accessibility */}
        <div
          className="flex items-center gap-2"
          aria-live="polite"
          aria-atomic="true"
        >
          <span
            ref={priceRef}
            className="font-bold text-lg transition-all duration-300"
            aria-label={`Current price: ${formatPrice(currentPrice)}`}
          >
            {formatPrice(currentPrice)}
          </span>
          {product.compare_at_price && (
            <span
              className="text-muted-foreground text-sm line-through"
              aria-label={`Original price: ${formatPrice(
                product.compare_at_price
              )}`}
            >
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>

      {/* Product Actions Footer */}
      <footer className="p-4 pt-0 space-y-3">
        {/* Variant Selector */}
        {hasVariants && (
          <div className="space-y-2">
            <label
              htmlFor={`variant-select-${product.id}`}
              className="text-sm font-medium text-foreground"
            >
              Select Variant
            </label>
            <Select
              onValueChange={(value) => {
                const variant = product.variants?.find((v) => v.id === value);
                setSelectedVariant(variant);
              }}
              defaultValue={selectedVariant?.id}
            >
              <SelectTrigger
                id={`variant-select-${product.id}`}
                className="w-full"
                aria-label="Choose product variant"
              >
                <SelectValue placeholder="Choose an option" />
              </SelectTrigger>
              <SelectContent>
                {product.variants?.map((variant) => (
                  <SelectItem
                    key={variant.id}
                    value={variant.id}
                    disabled={!variant.available}
                  >
                    <meta itemProp="sku" content={variant.sku || ""} />
                    <meta itemProp="priceCurrency" content="USD" />
                    {variant.title}
                    {!variant.available && " (Unavailable)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddToCart}
            disabled={isDisabled || isAddingToCart}
            className="w-full"
            aria-label={disabledReason || "Add to cart"}
            title={disabledReason}
          >
            {isAddingToCart ? (
              <Loader2
                className="w-4 h-4 mr-2 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <ShoppingCart className="w-4 h-4 mr-2" aria-hidden="true" />
            )}
            <span>{isAddingToCart ? "Adding..." : "Add to Cart"}</span>
          </Button>
          <BuyNowButton
            product={product}
            variant={selectedVariant}
            quantity={1}
            style="minimal"
            size="sm"
            disabled={isDisabled}
            className="w-full"
          />
        </div>
      </footer>
    </article>
  );
}
