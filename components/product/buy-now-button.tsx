"use client";

import { useFormStatus } from "react-dom";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiProduct, ApiProductImage, ApiProductVariant } from "@/lib/types";
import { buyNowAction } from "@/lib/buy-now-actions";
import { mergeUtmParams, UTMParams } from "@/lib/utils";

interface BuyNowButtonProps {
  product: ApiProduct;
  variant?: ApiProductVariant;
  quantity?: number;
  className?: string;
  style?: "default" | "minimal" | "full-width";
  size?: "sm" | "lg";
  utmParams?: UTMParams;
  disabled?: boolean;
}

export function BuyNowButton({
  product,
  variant,
  quantity = 1,
  className,
  style = "default",
  size = "lg",
  utmParams,
  disabled = false,
}: BuyNowButtonProps) {
  const mergedUtm = mergeUtmParams({ ...utmParams });

  const rawImage: unknown = variant?.featured_image ?? product.images?.[0] ?? "";
  const productImageUrl =
    typeof rawImage === "string"
      ? rawImage
      : rawImage && typeof (rawImage as ApiProductImage).src === "string"
      ? (rawImage as ApiProductImage).src
      : "";

  const variantMap = {
    default: "buy-now-default",
    minimal: "buy-now-minimal",
    "full-width": "buy-now-full",
  } as const;

  async function handleSubmit(formData: FormData) {
    console.log("[BuyNow] Form submitted");

    try {
      // 1️⃣ Create draft order on server
      const invoiceUrl = await buyNowAction(formData);
      console.log("[BuyNow] Invoice URL received:", invoiceUrl);

      if (!invoiceUrl) {
        console.error("[BuyNow] No invoice URL returned from server action.");
        alert("Something went wrong. Please try again.");
        return;
      }

      // 2️⃣ Detect iframe context
      const isInIframe = window.self !== window.top;
      console.log("[BuyNow] Running in iframe:", isInIframe);

      const parentOrigin = "https://www.vohovintage.shop";

      if (isInIframe) {
        const message = {
          type: "checkout",
          checkoutUrl: invoiceUrl,
          utm: mergedUtm,
          token: formData.get("utm_source") || "", // Optional token for validation
          product: {
            product_title: formData.get("productTitle"),
            product_image: formData.get("productImage"),
          },
        };

        console.log("[BuyNow] Sending message to parent:", message);

        try {
          window.parent.postMessage(message, parentOrigin);

          // 3️⃣ Fallback: If parent blocks postMessage or CSP blocks frame
          const timeout = setTimeout(() => {
            console.warn(
              "[BuyNow] No response from parent window. Redirecting directly..."
            );
            window.location.href = invoiceUrl;
          }, 1500);

          // Optional listener for confirmation from parent
          const listener = (event: MessageEvent) => {
            if (event.origin === parentOrigin && event.data === "checkout:received") {
              clearTimeout(timeout);
              window.removeEventListener("message", listener);
            }
          };
          window.addEventListener("message", listener);
        } catch (err) {
          console.error("[BuyNow] postMessage failed, redirecting directly:", err);
          window.location.href = invoiceUrl;
        }
      } else {
        // 4️⃣ Not in iframe, redirect directly
        console.log("[BuyNow] Not in iframe, redirecting to:", invoiceUrl);
        window.location.href = invoiceUrl;
      }
    } catch (error) {
      console.error("[BuyNow] Error handling submit:", error);
      alert("Checkout failed. Please refresh and try again.");
    }
  }

  function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <Button
        type="submit"
        disabled={disabled || pending}
        variant={variantMap[style]}
        className={className}
        size={size}
      >
        {pending ? (
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
        ) : (
          <ShoppingBag className="mr-2 w-4 h-4" />
        )}
        {pending ? "Processing..." : "Buy Now"}
      </Button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className={style === "full-width" ? "w-full" : ""}
    >
      <input type="hidden" name="productId" value={variant?.product_id || product.id} />
      <input type="hidden" name="variantId" value={variant?.id || ""} />
      <input type="hidden" name="price" value={variant?.price || product.price} />
      <input type="hidden" name="quantity" value={quantity} />
      <input type="hidden" name="productTitle" value={product.title} />
      <input type="hidden" name="productImage" value={productImageUrl} />

      <input type="hidden" name="utm_source" value={mergedUtm.utm_source} />
      <input type="hidden" name="utm_medium" value={mergedUtm.utm_medium} />
      <input type="hidden" name="utm_campaign" value={mergedUtm.utm_campaign} />

      <SubmitButton />
    </form>
  );
}
