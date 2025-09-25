'use client'

import { PrimaryCTA } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { checkoutSchema } from "@/lib/validations";
import { FormError } from "@/components/ui/form-error";

export default function CheckoutPage() {
  const { items, getTotalPrice } = useCart();
  const totalPrice = getTotalPrice();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: z.infer<typeof checkoutSchema>) => {
    // Simulate processing; replace with real payment handler
    await new Promise((r) => setTimeout(r, 800));
    console.log(data);
  };

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-8">
        Checkout
      </h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" disabled={isSubmitting} required {...register("firstName")} />
                <FormError message={errors.firstName?.message} />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" disabled={isSubmitting} required {...register("lastName")} />
                <FormError message={errors.lastName?.message} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" disabled={isSubmitting} required {...register("email")} />
              <FormError message={errors.email?.message} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" disabled={isSubmitting} required {...register("address")} />
              <FormError message={errors.address?.message} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" disabled={isSubmitting} required {...register("city")} />
                <FormError message={errors.city?.message} />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" disabled={isSubmitting} required {...register("postalCode")} />
                <FormError message={errors.postalCode?.message} />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" disabled={isSubmitting} required {...register("country")} />
                <FormError message={errors.country?.message} />
              </div>
            </div>
            <PrimaryCTA type="submit" className="w-full mt-4" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? 'Processing…' : 'Place Order'}
            </PrimaryCTA>
          </form>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p>{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold">
              <p>Total</p>
              <p>{formatPrice(totalPrice)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
