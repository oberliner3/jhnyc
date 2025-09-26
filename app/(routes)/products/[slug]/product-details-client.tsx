'use client'

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Truck, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";
import type { Product, ProductVariant } from "@/lib/types";
import { ProductReviews } from '@/components/product/product-reviews';
import { AddReviewForm } from '@/components/product/add-review-form';
import { getImageProxyUrl } from "@/lib/api";

interface ProductDetailsClientProps {
  product: Product;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const { addItem } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      const initialOptions: Record<string, string> = {};
      product.options?.forEach((option) => {
        initialOptions[option.name] = option.values[0];
      });
      setSelectedOptions(initialOptions);

      if (product.variants.length > 0) {
        const variantName = product.options
          .map((opt) => initialOptions[opt.name])
          .join(" / ");
        const variant = product.variants.find((v) => v.name === variantName);
        setSelectedVariant(variant || product.variants[0]);
      }
    }
  }, [product]);

  const handleOptionChange = (optionName: string, value: string) => {
    if (!product) return;
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);

    const variantName = product.options
      .map((opt) => newOptions[opt.name])
      .join(" / ");
    const variant = product.variants.find((v) => v.name === variantName);
    setSelectedVariant(variant);
  };

  const discountPercentage =
    product.compareAtPrice && selectedVariant
      ? Math.round(
          ((product.compareAtPrice - selectedVariant.price) /
            product.compareAtPrice) *
            100
        )
      : 0;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;

  return (
    <div className="gap-8 lg:gap-12 grid lg:grid-cols-2">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="relative bg-muted rounded-lg aspect-square overflow-hidden">
          <Image
            src={getImageProxyUrl(
              selectedVariant?.image || (product.images && product.images.length > 0 ? product.images[0].src : '/placeholder.svg')
            )}
            alt={product.title}
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
                key={`thumb-${product.id}-${image.id ?? index}`}
                className="relative bg-muted rounded-md aspect-square overflow-hidden"
              >
                <Image
                  src={getImageProxyUrl(image.src)}
                  alt={`${product.title} ${index + 2}`}
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
            {product.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={`star-${product.id}-${i}`}
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

        {/* Options */}
        {product.options &&
          product.options.length > 0 &&
          product.options[0].name !== "Title" && (
            <div className="space-y-4">
              {product.options.map((option) => (
                <div key={option.id}>
                  <h3 className="text-sm font-medium mb-2">{option.name}</h3>
                  <Select
                    onValueChange={(value) =>
                      handleOptionChange(option.name, value)
                    }
                    defaultValue={selectedOptions[option.name]}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${option.name}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {option.values.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
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
            {product.compareAtPrice && (
              <span className="text-muted-foreground text-lg line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          {product.compareAtPrice && discountPercentage > 0 && (
            <p className="text-green-600 text-sm">
              You save {formatPrice(product.compareAtPrice - currentPrice)} (
              {discountPercentage}%)
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
          <Button
            size="lg"
            className="w-full"
            disabled={!selectedVariant?.inStock}
            onClick={() => {
              if (selectedVariant) {
                addItem(product, selectedVariant, 1);
              }
            }}
          >
            {selectedVariant?.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>

          {selectedVariant?.inStock && (
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
            <span className="text-sm">Free shipping on orders over $50</span>
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

        <Separator />

        <ProductReviews />

        <Separator />

        <AddReviewForm productId={product.id} />
      </div>
    </div>
  );
}
