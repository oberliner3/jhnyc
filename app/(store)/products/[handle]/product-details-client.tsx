"use client";

import {
	ChevronLeft,
	ChevronRight,
	Minus,
	Plus,
	RefreshCw,
	Shield,
	Truck,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProductSchema } from "@/components/common/product-schema";
import { SafeHtml } from "@/components/common/safe-html";
import { BuyNowButton } from "@/components/product/buy-now-button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";
import type { ApiProduct, ApiProductVariant } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface ProductDetailsClientProps {
	product: ApiProduct;
}

function hasMultipleRealVariants(product: ApiProduct): boolean {
	const variants = product.variants || [];
	const nonDefault = variants.filter(
		(v) => (v.title || "").toLowerCase() !== "default title",
	);
	return nonDefault.length > 1;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
	const { addItem } = useCart();

	const [selectedVariant, setSelectedVariant] = useState<
		ApiProductVariant | undefined
	>();
	const [selectedOptions, setSelectedOptions] = useState<
		Record<string, string>
	>({});
	const [quantity, setQuantity] = useState(1);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	useEffect(() => {
		if (product) {
			const initialOptions: Record<string, string> = {};
			(product.options || []).forEach((option) => {
				initialOptions[option.name] = option.values[0];
			});
			setSelectedOptions(initialOptions);

			if ((product.variants || []).length > 0) {
				const variantName = (product.options || [])
					.map((opt) => initialOptions[opt.name])
					.join(" / ");
				const variant = (product.variants || []).find(
					(v) => v.title === variantName,
				);
				setSelectedVariant(variant || (product.variants || [])[0]);
			}
		}
	}, [product]);

	const handleOptionChange = (optionName: string, value: string) => {
		if (!product) return;
		const newOptions = { ...selectedOptions, [optionName]: value };
		setSelectedOptions(newOptions);

		const variantName = (product.options || [])
			.map((opt) => newOptions[opt.name])
			.join(" / ");
		const variant = (product.variants || []).find(
			(v) => v.title === variantName,
		);
		// Fallback to first available variant to avoid undefined selections
		setSelectedVariant(variant || (product.variants || [])[0]);
	};

	const handleQuantityChange = (newQuantity: number) => {
		if (newQuantity >= 1 && newQuantity <= 99) {
			setQuantity(newQuantity);
		}
	};

	const discountPercentage =
		product.compare_at_price && selectedVariant
			? Math.round(
					((product.compare_at_price - selectedVariant.price) /
						product.compare_at_price) *
						100,
				)
			: 0;

	const currentPrice = selectedVariant ? selectedVariant.price : product.price;
	const totalImages = product.images?.length || 0;
	const currentImage = product.images?.[selectedImageIndex] || {
		src: selectedVariant?.featured_image || "/og.png",
		alt: product.title,
	};

	const handlePreviousImage = () => {
		setSelectedImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
	};

	const handleNextImage = () => {
		setSelectedImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
	};

	return (
		<div className="gap-8 lg:gap-12 grid lg:grid-cols-2 p-4">
			<ProductSchema product={product} />
			{/* Product Images Gallery */}
			<div className="space-y-4">
				{/* Main Image with Navigation */}
				<div className="group relative bg-muted rounded-lg aspect-square overflow-hidden">
					<Image
						src={currentImage.src}
						alt={currentImage.alt || product.title}
						fill
						className="object-cover transition-transform duration-300"
						priority
					/>
					{discountPercentage > 0 && (
						<Badge variant="destructive" className="top-4 left-4 z-10 absolute">
							-{discountPercentage}%
						</Badge>
					)}

					{/* Image Navigation Arrows */}
					{totalImages > 1 && (
						<>
							<button
								type="button"
								onClick={handlePreviousImage}
								className="top-1/2 left-2 z-10 absolute bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 shadow-lg p-2 rounded-full transition-opacity -translate-y-1/2"
								aria-label="Previous image"
							>
								<ChevronLeft className="w-5 h-5" />
							</button>
							<button
								type="button"
								onClick={handleNextImage}
								className="top-1/2 right-2 z-10 absolute bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 shadow-lg p-2 rounded-full transition-opacity -translate-y-1/2"
								aria-label="Next image"
							>
								<ChevronRight className="w-5 h-5" />
							</button>

							{/* Image Counter */}
							<div className="right-4 bottom-4 z-10 absolute bg-black/60 px-2 py-1 rounded text-white text-sm">
								{selectedImageIndex + 1} / {totalImages}
							</div>
						</>
					)}
				</div>

				{/* Thumbnail Gallery */}
				{totalImages > 1 && (
					<div className="flex gap-2 pb-2 overflow-x-auto">
						{product.images.map((image, index) => (
							<button
								type="button"
								key={`thumb-${product.id}-${image.id ?? index}`}
								onClick={() => setSelectedImageIndex(index)}
								className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
									selectedImageIndex === index
										? "border-primary ring-2 ring-primary/30"
										: "border-transparent hover:border-gray-300"
								}`}
								aria-label={`View image ${index + 1}`}
							>
								<Image
									src={image.src}
									alt={`${product.title} ${index + 1}`}
									fill
									className="object-cover"
									sizes="80px"
								/>
							</button>
						))}
					</div>
				)}
			</div>

			{/* Product Info */}
			<div className="space-y-6">
				<div>
					<Badge variant="outline" className="m-2 p-2">
						{product.product_type}
					</Badge>
					<h1 className="font-bold text-3xl lg:text-4xl tracking-tight">
						{product.title}
					</h1>
				</div>

				{/* Options */}
				{product.options &&
					product.options.length > 0 &&
					product.options[0].name !== "Title" && (
						<div className="space-y-4">
							{(product.options || []).map((option) => (
								<div key={option.id}>
									<h3 className="mb-2 font-medium text-sm">{option.name}</h3>
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
						{product.compare_at_price &&
							product.compare_at_price >= product.price && (
								<span className="text-muted-foreground text-lg line-through">
									{formatPrice(product.compare_at_price)}
								</span>
							)}
					</div>
					{product.compare_at_price && discountPercentage > 0 && (
						<p className="text-green-600 text-sm">
							You save {formatPrice(product.compare_at_price - currentPrice)} (
							{discountPercentage}%) AA
						</p>
					)}
				</div>

				{/* Add to Cart & Buy Now */}
				<div className="relative flex flex-col gap-3">
					<div className="flex items-center gap-4 w-full">
						<div className="inline-flex">
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="icon"
									onClick={() => handleQuantityChange(quantity - 1)}
									disabled={quantity <= 1}
								>
									<Minus className="w-4 h-4" />
								</Button>
								<Input
									type="number"
									min="1"
									max="99"
									value={quantity}
									onChange={(e) =>
										handleQuantityChange(parseInt(e.target.value, 10) || 1)
									}
									className="w-16 text-center"
								/>
								<Button
									variant="outline"
									size="icon"
									onClick={() => handleQuantityChange(quantity + 1)}
									disabled={quantity >= 99}
								>
									<Plus className="w-4 h-4" />
								</Button>
							</div>
						</div>
						<Button
							size="lg"
							variant="default"
							className="inline-flex"
							onClick={() => {
								if (hasMultipleRealVariants(product) && !selectedVariant) {
									toast.error("Please select a product variant");
									return;
								}
								addItem(product, selectedVariant, quantity);
							}}
							disabled={!product.in_stock}
						>
							{product.in_stock ? "Add to Cart" : "Out of Stock"}
						</Button>
					</div>

					<BuyNowButton
						product={product}
						variant={selectedVariant}
						quantity={quantity}
						className="inline-flex bg-orange-400"
					/>
				</div>

				{/* Description */}
				<div className="bg-muted/40 p-4 rounded-lg">
					<Accordion type="single" collapsible className="bg-neutral-50 w-full">
						<AccordionItem value="details">
							<AccordionTrigger>Details</AccordionTrigger>
							<AccordionContent>
								<SafeHtml
									html={product.body_html || ""}
									className="text-muted-foreground"
								/>
								{product.tags && product.tags.length > 0 && (
									<div className="flex flex-wrap items-center gap-2 mt-4">
										{product.tags.split(",").map((tag) => (
											<Badge key={tag} variant="outline">
												{tag.split("_").join(" ").toUpperCase()}
											</Badge>
										))}
									</div>
								)}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>

				<Separator />

				{/* Product Features */}
				<div className="space-y-3">
					<div className="flex items-center gap-3">
						<Truck className="w-5 h-5 text-muted-foreground" />
						<span className="text-sm">Free shipping on orders over $99</span>
					</div>
					<div className="flex items-center gap-3">
						<RefreshCw className="w-5 h-5 text-muted-foreground" />
						<span className="text-sm">60-day return policy</span>
					</div>
					<div className="flex items-center gap-3">
						<Shield className="w-5 h-5 text-muted-foreground" />
						<span className="text-sm">2-year warranty included</span>
					</div>
				</div>
			</div>
		</div>
	);
}
