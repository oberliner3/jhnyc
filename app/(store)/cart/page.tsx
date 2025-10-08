"use client";

import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";

import { Suspense, useState } from "react";
import { toast } from "sonner";
import { EmptyCart } from "@/components/cart/empty-cart";
import { QuantityInput } from "@/components/cart/quantity-input";
import { CartSkeleton } from "@/components/skeletons/cart-skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";
import { checkoutCartAction } from "@/lib/buy-now-actions";
import { getProductPlaceholder } from "@/lib/placeholder";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

function CartContent() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = getTotalPrice();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsCheckingOut(true);
    try {
      // Extract UTM parameters from URL if available
      const urlParams = new URLSearchParams(window.location.search);
      const utmParams = {
        source: urlParams.get("utm_source") || undefined,
        medium: urlParams.get("utm_medium") || undefined,
        campaign: urlParams.get("utm_campaign") || undefined,
      };

      await checkoutCartAction(items, utmParams);
      // If successful, the action will redirect to payment page
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Checkout failed. Please try again."
      );
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="gap-8 grid lg:grid-cols-3">
      {/* Cart Items */}
      <div className="space-y-4 lg:col-span-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 border rounded-lg"
          >
            <Image
              src={item.image || getProductPlaceholder(item.name, 200, 200)}
              alt={item.name}
              width={80}
              height={80}
              className="rounded-md w-20 h-20 object-cover"
              unoptimized
            />
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-muted-foreground">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  updateQuantity(
                    item.product.id,
                    item.variant.id,
                    item.quantity - 1
                  )
                }
              >
                <Minus className="w-4 h-4" />
              </Button>
              <QuantityInput item={item} />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  updateQuantity(
                    item.product.id,
                    item.variant.id,
                    item.quantity + 1
                  )
                }
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeItem(item.product.id, item.variant.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-muted/50 p-6 rounded-lg">
        <h2 className="mb-4 font-semibold text-xl">Order Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
        <Button
          className="mt-6 w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={isCheckingOut}
        >
          {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
        </Button>
        <p className="mt-2 text-muted-foreground text-xs text-center">
          Shipping calculated at checkout
        </p>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <div className="px-4 py-8 container">
      <h1 className="mb-8 font-bold text-3xl lg:text-4xl tracking-tight">
        Shopping Cart
      </h1>

      <Suspense fallback={<CartSkeleton />}>
        <CartContent />
      </Suspense>
    </div>
  );
}
