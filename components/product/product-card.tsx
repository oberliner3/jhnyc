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
  const isOutOfStock = false; // can integrate real stock logic
  const isVariantUnavailable =
    hasVariants && selectedVariant && !selectedVariant.available;
  const isDisabled = false; // placeholder, replace with real logic if needed

  // Track price changes for accessibility
  const currentPrice = selectedVariant?.price || product.price;
  useEffect(() => {
    if (
      previousPrice !== null &&
      previousPrice !== currentPrice &&
      priceRef.current
    ) {
      priceRef.current.classList.add("price-updated");
      setTimeout(
        () => priceRef.current?.classList.remove("price-updated"),
        600
      );
    }
    setPreviousPrice(currentPrice);
  }, [currentPrice, previousPrice]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDisabled || isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await addItem(product, selectedVariant, 1);
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Proxy all Shopify images via /cdn
  const proxiedImages =
    product.images?.map((img) => ({
      ...img,
      src: img.src.replace(
        "https://cdn.shopify.com",
        "https://jhuangnyc.com/cdn"
      ),
    })) || [];

  const currentImage = proxiedImages[currentImageIndex]?.src || "/og.png";
  const currentImageAlt =
    proxiedImages[currentImageIndex]?.alt ||
    `${product.title}${
      selectedVariant?.title && selectedVariant.title !== "Default Title"
        ? ` - ${selectedVariant.title}`
        : ""
    }`;

  const fullDescription = stripHtml(product.body_html || "");
  const shortDescription = fullDescription.slice(0, 100);
  const isDescriptionTruncated = fullDescription.length > 100;

  const handleImageNavigation = useCallback(
    (direction: "next" | "prev") => {
      if (!hasMultipleImages) return;
      setCurrentImageIndex((prev) =>
        direction === "next"
          ? (prev + 1) % proxiedImages.length
          : (prev - 1 + proxiedImages.length) % proxiedImages.length
      );
    },
    [hasMultipleImages, proxiedImages.length]
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

  const getDisabledReason = () => {
    if (isOutOfStock) return "This product is currently out of stock";
    if (isVariantUnavailable) return "This variant is currently unavailable";
    if (hasVariants && !selectedVariant) return "Please select a variant";
    return undefined;
  };
  const disabledReason = getDisabledReason();

  return (
    <article
      className="group relative flex flex-col bg-card hover:shadow-xl border rounded-lg focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden text-card-foreground transition-all duration-300"
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
          isDescriptionTruncated ? `${shortDescription}...` : shortDescription
        }
      />

      {/* Product Image */}
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
              loading="lazy"
            />

            <div className="top-2 left-2 z-10 absolute flex flex-col gap-2">
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

            {hasMultipleImages && (
              <div
                className="bottom-2 left-1/2 absolute flex gap-1 -translate-x-1/2"
                aria-hidden="true"
              >
                {proxiedImages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>
        {hasMultipleImages && (
          <span className="sr-only">
            Use arrow keys to navigate {proxiedImages.length} images. Currently
            showing {currentImageIndex + 1} of {proxiedImages.length}.
          </span>
        )}
      </header>

      {/* Product Info */}
      <div className="flex-grow space-y-3 p-4">
        <h3 className="font-semibold group-hover:text-primary text-base line-clamp-1 transition-colors">
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

      {/* Footer Actions */}
      <footer className="space-y-2 p-4 pt-0">
        {hasVariants && (
          <div className="space-y-2">
            <label
              htmlFor={`variant-select-${product.id}`}
              className="font-medium text-foreground text-sm"
            >
              Select Variant
            </label>
            <Select
              onValueChange={(value) =>
                setSelectedVariant(
                  product.variants?.find((v) => v.id === value)
                )
              }
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

        <div className="gap-2 grid grid-cols-2">
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
                className="mr-2 w-4 h-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <ShoppingCart className="mr-2 w-4 h-4" aria-hidden="true" />
            )}
            {isAddingToCart ? "Adding..." : "Add to Cart"}
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
