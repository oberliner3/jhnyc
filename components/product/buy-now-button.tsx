"use client";

import { useFormStatus } from "react-dom";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buyNowAction } from "@/lib/buy-now-actions";
import { mergeUtmParams, UTMParams } from "@/lib/utils";
import { ApiProduct, ApiProductVariant } from "@/lib/types";

interface BuyNowButtonProps {
  product: ApiProduct;
  variant?: ApiProductVariant;
  quantity?: number;
  className?: string; // ✅ allow className
  style?: "default" | "minimal" | "full-width";
  size?: "sm" | "lg";
  utmParams?: UTMParams;
  disabled?: boolean;
}

export function BuyNowButton({
  product,
  variant,
  quantity = 1,
  className, // ✅ accept className
  style = "default",
  size = "lg",
  utmParams,
  disabled = false,
}: BuyNowButtonProps) {
  const mergedUtm = mergeUtmParams({ ...utmParams });

  const productImage =
    variant?.featured_image || product.images?.[0]?.src || "";

  async function handleSubmit(formData: FormData) {
    const invoiceUrl = await buyNowAction(formData);

    const isInIframe = window.self !== window.top;

    if (isInIframe) {
      window.parent.postMessage(
        {
          type: "checkout",
          checkoutUrl: invoiceUrl,
          utm: mergedUtm,
          product: {
            product_title: formData.get("productTitle"),
            product_image: formData.get("productImage"),
          },
        },
        "*"
      );
    } else {
      window.location.href = invoiceUrl;
    }
  }

  return (
    <form action={handleSubmit}>
      
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
      <input type="hidden" name="productImage" value={productImage} />
      <input type="hidden" name="utm_source" value={mergedUtm.utm_source} />
      <input type="hidden" name="utm_medium" value={mergedUtm.utm_medium} />
      <input type="hidden" name="utm_campaign" value={mergedUtm.utm_campaign} />
      
      <Button
        type="submit"
        disabled={disabled}
        id="buy-now-button"
        className={className}
      >
        <ShoppingBag className="mr-2 w-4 h-4" />Buy Now
      </Button>
      
    </form>
  );
}
