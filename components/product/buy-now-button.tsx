"use client";

import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiProduct, ApiProductVariant } from "@/lib/types";
import { toast } from "sonner";
import { buyNowAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface BuyNowButtonProps {
  product: ApiProduct;
  variant?: ApiProductVariant;
  quantity?: number;
  className?: string;
  style?: 'default' | 'minimal' | 'full-width';
  size?: 'sm' | 'lg';
  utmParams?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
}

export function BuyNowButton({
  product,
  variant,
  quantity = 1,
  className,
  style = 'default',
  size = 'lg',
  utmParams = {
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'buy-now'
  },
}: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    toast.loading("Processing your order...", {
      id: "buy-now-processing",
      description: `Adding ${product.title} to checkout`,
    });
  };

  const handleError = (error?: unknown) => {
    setIsLoading(false);
    toast.dismiss("buy-now-processing");
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    toast.error("Failed to process order", {
      description: errorMessage,
      classNames: {
        description: "!text-red-500",
      },
    });
  };

  // Style variations inspired by the PHP implementation
  const getButtonStyles = () => {
    const baseStyles = "transition-all duration-300 ease-in-out font-semibold text-white !important border-none cursor-pointer";
    
    switch (style) {
      case 'minimal': // Corresponds to .custom-buy-now-loop
        return cn(
          baseStyles,
          "bg-[#212121] hover:bg-[#757575] text-white",
          "rounded-sm px-5 py-2.5 text-sm w-full text-center"
        );
      case 'full-width': // Corresponds to .custom-buy-now-button
        return cn(
          baseStyles,
          "bg-[#212121] hover:bg-[#757575] text-white w-full",
          "rounded-sm text-center",
          "py-[16px] px-[28px] text-[16px]", // Base styles
          "max-w-md:py-[18px] max-w-md:px-[20px] max-w-md:text-[15px]", // Tablet
          "max-w-xs:py-[18px] max-w-xs:px-[18px] max-w-xs:text-[14px]" // Mobile
        );
      default:
        return cn(
          "bg-orange-500 hover:bg-orange-600 text-white",
          baseStyles
        );
    }
  };

  return (
    <form
      action={async (formData) => {
        try {
          await buyNowAction(formData);
        } catch (error) {
          handleError(error);
        }
      }}
      onSubmit={handleSubmit}
      className={style === 'full-width' ? 'w-full' : ''}
    >
      <input
        type="hidden"
        name="productId"
        value={variant?.product_id || product.id}
      />
      <input type="hidden" name="variantId" value={variant?.id || ""} />
      <input
        type="hidden"
        name="price"
        value={variant?.price || product.price}
      />
      <input type="hidden" name="quantity" value={quantity} />
      <input type="hidden" name="productTitle" value={product.title} />
      <input
        type="hidden"
        name="productImage"
        value={variant?.featured_image || product.images?.[0]?.src || ""}
      />
      
      {/* UTM Parameters */}
      <input type="hidden" name="utm_source" value={utmParams.utm_source} />
      <input type="hidden" name="utm_medium" value={utmParams.utm_medium} />
      <input type="hidden" name="utm_campaign" value={utmParams.utm_campaign} />

      <Button
        type="submit"
        disabled={isLoading || !product.in_stock || !variant}
        className={cn(
          getButtonStyles(),
          style === 'full-width' && 'w-full',
          className
        )}
        size={size}
      >
        {isLoading ? (
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
        ) : (
          <ShoppingBag className="mr-2 w-4 h-4" />
        )}
        {isLoading ? "Processing..." : "Buy Now"}
      </Button>
    </form>
  );
}