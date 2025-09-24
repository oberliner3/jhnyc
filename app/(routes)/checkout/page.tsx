'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { checkoutSchema } from "@/lib/validations";

export default function CheckoutPage() {
  const { items, getTotalPrice } = useCart();
  const totalPrice = getTotalPrice();

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = (data: z.infer<typeof checkoutSchema>) => {
    console.log(data);
    // Here you would typically handle payment processing
  };

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-8">
        Checkout
      </h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register("address")} />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" {...register("postalCode")} />
                {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>}
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register("country")} />
                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full mt-4">Place Order</Button>
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
