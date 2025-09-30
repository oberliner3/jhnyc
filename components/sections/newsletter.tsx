"use client";

import { Gift, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Simulate API call
		setTimeout(() => {
			setIsLoading(false);
			setIsSuccess(true);
			setEmail("");
		}, 1000);
	};

	return (
    <section className="py-16 lg:py-24 text-primary-foreground bg-neutral-900 text-neutral-50 bg-gradient-to-r from-shopify-green/50 to-shopify-purple/50">
      <div className="px-4 container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center items-center bg-primary-foreground/20 mx-auto mb-6 rounded-full w-16 h-16">
            <Gift className="w-8 h-8" />
          </div>

          <h2 className="mb-4 font-bold text-3xl lg:text-4xl tracking-tight">
            Get 15% Off Your First Order
          </h2>
          <p className="opacity-90 mb-8 text-lg">
            Join our newsletter and be the first to know about new products,
            exclusive deals, and special promotions.
          </p>

          {isSuccess ? (
            <div className="bg-primary-foreground/20 p-6 rounded-lg">
              <div className="mb-2 text-2xl">🎉</div>
              <h3 className="mb-2 font-semibold text-xl">Welcome aboard!</h3>
              <p className="opacity-90">
                Check your email for your exclusive 15% off promo code.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex sm:flex-row flex-col gap-4 mx-auto max-w-md"
            >
              <div className="relative flex-1">
                <Mail className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-primary-foreground pl-10 text-foreground"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                disabled={isLoading}
                className="px-8"
              >
                {isLoading ? "Subscribing..." : "Get My Code"}
              </Button>
            </form>
          )}

          <p className="opacity-75 mt-4 text-sm">
            By subscribing, you agree to receive promotional emails. You can
            unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
