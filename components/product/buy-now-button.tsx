"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiProduct, ApiProductVariant } from "@/lib/types";
import { toast } from "sonner";
import { buyNowAction } from "@/lib/actions";

interface BuyNowButtonProps {
	product: ApiProduct;
	variant?: ApiProductVariant;
	quantity?: number;
	className?: string;
	collectCustomerEmail?: boolean; // New: whether to collect customer email
	customerEmail?: string; // New: pre-filled customer email
}

function createDefaultVariant(product: ApiProduct): ApiProductVariant {
	const firstVariant = product.variants?.[0];
	return {
		id: firstVariant?.id || product.id,
		product_id: product.id,
		title: firstVariant?.title || "Default Title",
		price: product.price,
		sku: firstVariant?.sku || "",
		grams: firstVariant?.grams || 0,
		featured_image: product.images?.[0]?.src,
		available: product.in_stock,
		requires_shipping: firstVariant?.requires_shipping ?? true,
		taxable: firstVariant?.taxable ?? true,
		compare_at_price: product.compare_at_price,
		position: 1,
		created_at: product.created_at,
		updated_at: product.updated_at,
	};
}

function hasMultipleRealVariants(product: ApiProduct): boolean {
	const variants = product.variants || [];
	// Treat multiple variants with non-default titles as "real" variants
	const nonDefault = variants.filter(
		(v) => (v.title || "").toLowerCase() !== "default title",
	);
	return nonDefault.length > 1;
}

export function BuyNowButton({
	product,
	variant,
	quantity = 1,
	className,
	collectCustomerEmail = false,
	customerEmail = "",
}: BuyNowButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState(customerEmail);

	// UX guard: require explicit selection only when the product has multiple real variants
	if (hasMultipleRealVariants(product) && !variant) {
		// Show a disabled button with guidance if no variant selected
		return (
			<Button disabled className={className} size="lg">
				<ShoppingBag className="mr-2 w-4 h-4" />
				Select a variant
			</Button>
		);
	}

	const selectedVariant =
		variant || product.variants?.[0] || createDefaultVariant(product);

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
		});
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
		>
			<input
				type="hidden"
				name="productId"
				value={selectedVariant.product_id}
			/>
			<input type="hidden" name="variantId" value={selectedVariant.id} />
			<input type="hidden" name="price" value={selectedVariant.price} />
			<input type="hidden" name="quantity" value={quantity} />
			<input type="hidden" name="productTitle" value={product.title} />
			<input
				type="hidden"
				name="productImage"
				value={product.images?.[0]?.src || ""}
			/>
			{collectCustomerEmail && (
				<input type="hidden" name="customerEmail" value={email} />
			)}

			{collectCustomerEmail && (
				<div className="mb-4">
					<label
						htmlFor="customer-email"
						className="block text-sm font-medium mb-2"
					>
						Email (for invoice)
					</label>
					<input
						id="customer-email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="your@email.com"
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						required={collectCustomerEmail}
					/>
				</div>
			)}

			<Button
				type="submit"
				disabled={isLoading || !product.in_stock}
				className={className}
				size="lg"
			>
				<ShoppingBag className="mr-2 w-4 h-4" />
				{isLoading ? "Processing..." : "Buy Now"}
			</Button>
		</form>
	);
}
