"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getErrorPlaceholder } from "@/lib/placeholder";

interface SmartImageProps {
	src?: string | null;
	alt: string;
	fallbackText?: string;
	width?: number;
	height?: number;
	className?: string;
	fill?: boolean;
	sizes?: string;
	priority?: boolean;
	quality?: number;
	onError?: () => void;
}

/**
 * Smart Image component that automatically handles:
 * - SVG placeholders with proper unoptimized flag
 * - Error states with fallback images
 * - Automatic placeholder detection
 */
export function SmartImage({
	src,
	alt,
	fallbackText,
	width,
	height,
	className,
	fill = false,
	sizes,
	priority = false,
	quality = 75,
	onError,
}: SmartImageProps) {
	const [hasError, setHasError] = useState(false);

	// Determine if the source is a placeholder or SVG that needs unoptimized flag
	const needsUnoptimized =
		!src ||
		hasError ||
		src.includes("placeholdit.com") ||
		src.includes(".svg") ||
		src.includes("placeholder");

	// Get the final image source
	const imageSrc = hasError
		? getErrorPlaceholder(fallbackText || alt, width, height)
		: src || getErrorPlaceholder(fallbackText || alt, width, height);

	const handleError = () => {
		setHasError(true);
		onError?.();
	};

	const commonProps = {
		src: imageSrc,
		alt,
		className: cn("object-cover", className),
		priority,
		quality,
		onError: handleError,
		unoptimized: needsUnoptimized,
	};

	if (fill) {
		return <Image {...commonProps} alt={alt} fill sizes={sizes || "100vw"} />;
	}

	return (
		<Image
			{...commonProps}
			alt={alt}
			width={width || 800}
			height={height || 800}
		/>
	);
}

/**
 * Product-specific smart image with product dimensions
 */
export function ProductImage({
	src,
	alt,
	size = 300,
	className,
	...props
}: Omit<SmartImageProps, "width" | "height"> & { size?: number }) {
	return (
		<SmartImage
			src={src}
			alt={alt}
			width={size}
			height={size}
			className={cn("rounded-lg", className)}
			fallbackText="Product"
			{...props}
		/>
	);
}

/**
 * Logo-specific smart image with logo dimensions
 */
export function LogoImage({
	src,
	alt,
	width = 200,
	height = 100,
	className,
	...props
}: SmartImageProps) {
	return (
		<SmartImage
			src={src}
			alt={alt}
			width={width}
			height={height}
			className={cn("object-contain", className)}
			fallbackText="Logo"
			{...props}
		/>
	);
}
