"use client";

import {
	AlertCircle,
	ArrowLeft,
	CreditCard,
	Lock,
	Mail,
	MapPin,
	Phone,
	Shield,
	Truck,
	User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { cn, formatPrice } from "@/lib/utils";
import { checkoutSchema } from "@/lib/validations";
import { handleCheckout } from "./actions";
import { CountrySelector } from "@/components/checkout/country-selector";
import { AddressInput } from "@/components/checkout/address-input";
import { PhoneInput } from "@/components/checkout/phone-input";
import { useFormValidation } from "@/hooks/use-form-validation";
import { CountryCode } from "libphonenumber-js";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneValid, setPhoneValid] = useState(false);
  const { formData, setFieldValue, validationState } = useFormValidation({
    initialData: {
      email: user?.email || "",
      firstName: "",
      lastName: "",
      address: {
        street: "",
        city: "",
        country: "US",
        postalCode: "",
        state: "",
      },
      phone: "",
    },
  });

  const totalPrice = getTotalPrice();
  const shipping = totalPrice > 50 ? 0 : 9.99;
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + shipping + tax;

  const inputFirtNameId = useId();
  const inputLastNameId = useId();
  const inputEmailId = useId();
  const inputCityId = useId();
  const inputPostalCodeId = useId();

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  const handleInputChange = (field: string, value: string) => {
    setFieldValue(field, value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // Validate form data
      const validatedData = checkoutSchema.parse(formData);

      // Create order data
      const orderData = {
        items: items.map((item) => ({
          productId: item.product.id,
          variantId: item.variant.id,
          quantity: item.quantity,
          price: item.variant.price,
        })),
        customer: validatedData,
        totals: {
          subtotal: totalPrice,
          shipping,
          tax,
          total: finalTotal,
        },
      };

      // Process checkout
      const result = await handleCheckout(orderData);

      if (result.success) {
        // Clear cart and redirect to success page
        clearCart();
        router.push(`/checkout/success?order=${result.orderId}`);
      } else {
        setError(result.error || "Checkout failed. Please try again.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-bold text-2xl tracking-tight">Checkout</h1>
              <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                <Lock className="w-4 h-4" />
                <Shield className="w-4 h-4" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>

          <div className="gap-8 grid lg:grid-cols-[2fr_1fr]">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Express Checkout */}
              <div className="bg-white p-6 border rounded-lg">
                <h2 className="mb-4 font-semibold text-lg">Express checkout</h2>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="bg-purple-600 hover:bg-purple-700 border-purple-600 w-full h-12 text-white"
                  >
                    Shop Pay
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-yellow-500 hover:bg-yellow-600 border-yellow-500 w-full h-12 text-white"
                  >
                    PayPal
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-black hover:bg-gray-800 border-black w-full h-12 text-white"
                  >
                    Google Pay
                  </Button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white p-6 border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <Phone className="w-4 h-4" />
                    Contact
                  </h2>
                  <Link
                    href="/auth/signin"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Sign in
                  </Link>
                </div>
                <div>
                  <Label htmlFor={inputEmailId}>
                    Email or mobile phone number
                  </Label>
                  <Input
                    id={inputEmailId}
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email or phone"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white p-6 border rounded-lg">
                <h2 className="mb-4 font-semibold text-lg flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <Truck className="w-4 h-4" />
                  Delivery
                </h2>
                <div className="space-y-4">
                  {/* Country/Region */}
                  <CountrySelector
                    value={formData.address?.country || "US"}
                    onValueChange={(value) =>
                      handleInputChange("address.country", value)
                    }
                    error={
                      validationState["address.country"]?.error || undefined
                    }
                  />

                  {/* Name Fields */}
                  <div className="gap-4 grid grid-cols-2">
                    <div>
                      <Label
                        htmlFor={inputFirtNameId}
                        className={cn(
                          validationState.firstName?.error && "text-destructive"
                        )}
                      >
                        First name
                      </Label>
                      <Input
                        id={inputFirtNameId}
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className={cn(
                          "mt-1",
                          validationState.firstName?.error &&
                            "border-destructive"
                        )}
                        required
                      />
                      {validationState.firstName?.error && (
                        <span className="text-sm text-destructive">
                          {validationState.firstName.error}
                        </span>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor={inputLastNameId}
                        className={cn(
                          validationState.lastName?.error && "text-destructive"
                        )}
                      >
                        Last name
                      </Label>
                      <Input
                        id={inputLastNameId}
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className={cn(
                          "mt-1",
                          validationState.lastName?.error &&
                            "border-destructive"
                        )}
                        required
                      />
                      {validationState.lastName?.error && (
                        <span className="text-sm text-destructive">
                          {validationState.lastName.error}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <AddressInput
                    value={formData.address?.street || ""}
                    onChange={(value) =>
                      handleInputChange("address.street", value)
                    }
                    onAddressSelect={(address) => {
                      handleInputChange("address.street", address.street);
                      handleInputChange("address.city", address.city);
                      handleInputChange(
                        "address.postalCode",
                        address.postalCode
                      );
                      // Some countries might not have states
                      if (address.state) {
                        handleInputChange("address.state", address.state);
                      }
                    }}
                    error={
                      validationState["address.street"]?.error || undefined
                    }
                  />

                  {/* Apartment/Suite (using state field) */}
                  <Input
                    placeholder="Apartment, suite, etc. (optional)"
                    value={formData.address?.state || ""}
                    onChange={(e) =>
                      handleInputChange("address.state", e.target.value)
                    }
                    className="mt-1"
                  />

                  {/* City and Postal Code */}
                  <div className="gap-4 grid grid-cols-2">
                    <div>
                      <Label
                        htmlFor={inputCityId}
                        className={cn(
                          validationState["address.city"]?.error &&
                            "text-destructive"
                        )}
                      >
                        City
                      </Label>
                      <Input
                        id={inputCityId}
                        value={formData.address?.city || ""}
                        onChange={(e) =>
                          handleInputChange("address.city", e.target.value)
                        }
                        className={cn(
                          "mt-1",
                          validationState["address.city"]?.error &&
                            "border-destructive"
                        )}
                        required
                      />
                      {validationState["address.city"]?.error && (
                        <span className="text-sm text-destructive">
                          {validationState["address.city"].error}
                        </span>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={inputPostalCodeId}>Postal code</Label>
                      <Input
                        id={inputPostalCodeId}
                        value={formData.address?.postalCode || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "address.postalCode",
                            e.target.value
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <PhoneInput
                    value={formData.phone || ""}
                    onChange={(value, isValid) => {
                      handleInputChange("phone", value);
                      setPhoneValid(isValid);
                    }}
                    countryCode={
                      (formData.address?.country as CountryCode) || "US"
                    }
                    error={validationState.phone?.error || undefined}
                  />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white p-6 border rounded-lg">
              <h2 className="mb-4 font-semibold text-lg flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Shipping method
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-gray-50 p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <Truck className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="font-medium">Free Shipping</p>
                      <p className="text-gray-600 text-sm">Standard delivery</p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    FREE
                  </Badge>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white p-6 border rounded-lg">
              <h2 className="mb-4 font-semibold text-lg flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment
                <span className="ml-2 flex items-center gap-2 text-gray-600 text-sm">
                  <Lock className="w-4 h-4" />
                  <Shield className="w-4 h-4" />
                  <span>Secure</span>
                </span>
              </h2>
              <p className="mb-4 text-gray-600 text-sm">
                All transactions are secure and encrypted.
              </p>

              <div className="space-y-4">
                {/* Credit Card Option */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="radio"
                      name="payment"
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Credit card</span>
                      <div className="flex items-center gap-1">
                        <Image
                          src="/payment-logos/cards/visa.svg"
                          alt="Visa"
                          width={24}
                          height={16}
                          className="object-contain"
                        />
                        <Image
                          src="/payment-logos/cards/mastercard.svg"
                          alt="Mastercard"
                          width={24}
                          height={16}
                          className="object-contain"
                        />
                        <Image
                          src="/payment-logos/cards/american-express.svg"
                          alt="American Express"
                          width={24}
                          height={16}
                          className="object-contain"
                        />
                        <span className="text-gray-500 text-xs">+5</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 text-center text-sm text-muted-foreground border rounded-lg">
                      [Secure payment provider integration (e.g., Stripe
                      Elements) will go here]
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <Label className="text-sm">
                    Use shipping address as billing address
                  </Label>
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <div className="bg-white p-6 border rounded-lg">
              <h2 className="mb-4 font-semibold text-lg flex items-center gap-2">
                <User className="w-4 h-4" />
                Remember me
              </h2>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <Label className="text-sm">
                  Save my information for a faster checkout with a Shop account
                </Label>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 p-3 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            )}

            {/* Complete Order Button */}
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 w-full h-12 text-white"
              disabled={isProcessing || (formData.phone ? !phoneValid : false)}
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 border-white border-b-2 rounded-full w-4 h-4 animate-spin"></div>
                  Processing...
                </>
              ) : (
                `Complete order - ${formatPrice(finalTotal)}`
              )}
            </Button>

            {/* Shop Account Info */}
            <p className="text-gray-600 text-xs text-center">
              Your info will be saved to a Shop account. By continuing, you
              agree to Shop&apos;s Terms of Service and acknowledge the Privacy
              Policy.
            </p>

            {/* Footer Links */}
            <div className="flex flex-wrap justify-center gap-4 text-gray-600 text-xs">
              <Link href="/policies/refund" className="hover:underline">
                Refund policy
              </Link>
              <Link href="/policies/shipping" className="hover:underline">
                Shipping
              </Link>
              <Link href="/policies/privacy" className="hover:underline">
                Privacy policy
              </Link>
              <Link href="/policies/terms" className="hover:underline">
                Terms of service
              </Link>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="top-8 sticky bg-white p-6 border rounded-lg">
              <h2 className="mb-4 font-semibold text-lg">Order summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.variant.id}`}
                    className="flex gap-3"
                  >
                    <div className="relative flex-shrink-0 bg-gray-100 rounded-md w-16 h-16 overflow-hidden">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                      <div className="-top-1 -right-1 absolute flex justify-center items-center bg-gray-800 rounded-full w-5 h-5 text-white text-xs">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                      {item.variant.title !== "Default Title" && (
                        <p className="mt-1 text-gray-600 text-xs">
                          {item.variant.title}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600 text-sm">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-medium text-sm">
                          {formatPrice(item.variant.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 text-xs"
                      >
                        FREE
                      </Badge>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
