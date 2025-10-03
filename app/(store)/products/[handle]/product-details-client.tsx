"use client";

import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Shield,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ProductSchema } from "@/components/common/product-schema";
import { SafeHtml } from "@/components/common/safe-html";
import { BuyNowButton } from "@/components/product/buy-now-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useProductVariants } from "@/hooks/use-product-variants";
import type { ApiProduct } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface ProductDetailsClientProps {
  product: ApiProduct;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const { selectedVariant, selectedOptions, handleOptionChange } =
    useProductVariants(product);

  const [quantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const discountPercentage =
    product.compare_at_price && selectedVariant
      ? Math.round(
          ((product.compare_at_price - selectedVariant.price) /
            product.compare_at_price) *
            100
        )
      : 0;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const totalImages = product.images?.length || 0;
  const currentImage = product.images?.[selectedImageIndex] || {
    src: selectedVariant?.featured_image || "/og.png",
    alt: product.title,
  };

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  return (
    <div className="mx-auto p-0 sm:p-0 lg:p-8 overflow-hidden container">
      <div className="gap-8 lg:gap-12 grid grid-cols-1 md:grid-cols-2">
        <ProductSchema product={product} />
        {/* Product Images Gallery */}
        <div className="space-y-4">
          {/* Main Image with Navigation */}
          <div className="group relative flex bg-muted bg-white rounded-lg aspect-square overflow-hidden">
            <Image
              src={currentImage.src}
              alt={currentImage.alt || product.title}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="w-full h-auto object-cover transition-transform duration-300"
            />
            {discountPercentage > 0 && (
              <Badge
                variant="destructive"
                className="top-4 left-4 z-10 absolute"
              >
                -{discountPercentage}%
              </Badge>
            )}

            {/* Image Navigation Arrows */}
            {totalImages > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePreviousImage}
                  className="top-1/2 left-2 z-10 absolute bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 shadow-lg p-2 rounded-full transition-opacity -translate-y-1/2"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="top-1/2 right-2 z-10 absolute bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 shadow-lg p-2 rounded-full transition-opacity -translate-y-1/2"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Image Counter */}
                <div className="right-4 bottom-4 z-10 absolute bg-black/60 px-2 py-1 rounded text-white text-sm">
                  {selectedImageIndex + 1} / {totalImages}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {totalImages > 1 && (
            <div className="flex gap-2 pb-2 overflow-x-auto scroll-smooth no-scrollbar">
              {product.images.map((image, index) => (
                <button
                  type="button"
                  key={`thumb-${product.id}-${image.id ?? index}`}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-transparent hover:border-gray-300"
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={image.src}
                    alt={`${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="outline" className="m-2 p-2">
              {product.product_type.split("/")[0]}
            </Badge>
            <h1 className="font-bold text-xl lg:text-4xl tracking-tight">
              {product.title.toWellFormed()}
            </h1>
          </div>

          {/* Options */}

          {product.variants &&
            product.variants.length > 0 &&
            product.variants[0].title !== "Title" && (
              <div className="space-y-4">
                {(product.variants || []).map((variant) => (
                  <div key={variant.id}>
                    <h3 className="mb-2 font-medium text-sm">
                      {variant.title}
                    </h3>
                    <Select
                      onValueChange={(value) =>
                        handleOptionChange(variant.title, value)
                      }
                      defaultValue={selectedOptions[variant.title]}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${variant.title}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {product.variants.map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-bold text-3xl">
                {formatPrice(currentPrice)}
              </span>

              {product.compare_at_price && product.compare_at_price > 0
                ? product.compare_at_price >= product.price && (
                    <span className="font-semibold text-red-500 text-lg line-through">
                      {formatPrice(product.compare_at_price)}
                    </span>
                  )
                : null}
            </div>
            {product.compare_at_price && discountPercentage > 0 ? (
              <p className="text-green-600 text-sm">
                You save {formatPrice(product.compare_at_price - currentPrice)}{" "}
                ({discountPercentage}%)
              </p>
            ) : null}
          </div>

          {/* Add to Cart & Buy Now */}
          <div className="flex flex-col gap-3 p-4 rounded-md">
            <BuyNowButton
              product={product}
              variant={selectedVariant}
              quantity={quantity}
              style="full-width"
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="bg-muted/40 shadow-sm p-1 rounded-lg transition-colors">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger className="p-4">
                  <h3 className="font-bold">Details</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <SafeHtml
                    html={product.body_html || ""}
                    className="text-foreground"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {product.tags.split(",").map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag.split("_").join(" ").toUpperCase()}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Product Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">Free shipping on orders over $99</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">60-day return policy</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">2-year warranty included</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
