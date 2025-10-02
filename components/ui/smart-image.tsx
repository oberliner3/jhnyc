"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
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
	loading?: "eager" | "lazy";
	objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
	blurDataURL?: string;
	placeholder?: "blur" | "empty";
	aspectRatio?: "auto" | "square" | "video" | "portrait" | "custom";
	customAspectRatio?: string;
	withErrorBoundary?: boolean;
}

/**
 * Smart Image component that automatically handles:
 * - SVG placeholders with proper unoptimized flag
 * - Error states with fallback images
 * - Automatic placeholder detection
 * - Aspect ratio control
 * - Blur-up loading effect
 * - Loading strategy optimization
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
	loading = "lazy",
	objectFit = "cover",
	blurDataURL,
	placeholder,
	aspectRatio = "auto",
	customAspectRatio,
	withErrorBoundary = false,
}: SmartImageProps) {
	const [hasError, setHasError] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);

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

	// Handle aspect ratio styling
	const getAspectRatioClass = () => {
		switch (aspectRatio) {
			case "square":
				return "aspect-square";
			case "video":
				return "aspect-video";
			case "portrait":
				return "aspect-[3/4]";
			case "custom":
				return customAspectRatio ? `aspect-[${customAspectRatio}]` : "";
			default:
				return "";
		}
	};

	const handleError = () => {
		setHasError(true);
		onError?.();
	};

	const handleLoad = () => {
		setIsLoaded(true);
	};

	// Determine object-fit class
	const getObjectFitClass = () => {
		switch (objectFit) {
			case "contain":
				return "object-contain";
			case "cover":
				return "object-cover";
			case "fill":
				return "object-fill";
			case "none":
				return "object-none";
			case "scale-down":
				return "object-scale-down";
			default:
				return "object-cover";
		}
	};

	const commonProps = {
		src: imageSrc,
		alt,
		className: cn(
			getObjectFitClass(),
			getAspectRatioClass(),
			isLoaded ? "opacity-100" : "opacity-0",
			"transition-opacity duration-300",
			className
		),
		priority,
		quality,
		onError: handleError,
		onLoad: handleLoad,
		loading,
		unoptimized: needsUnoptimized,
		placeholder: placeholder,
		blurDataURL: blurDataURL,
	};

	const imageComponent = fill ? (
		<Image {...commonProps} alt={alt} fill sizes={sizes || "100vw"} />
	) : (
		<Image
			{...commonProps}
			alt={alt}
			width={width || 800}
			height={height || 800}
		/>
	);

	return (
		<div className={cn("relative overflow-hidden", getAspectRatioClass())}>
			{!isLoaded && !priority && (
				<div className="absolute inset-0 bg-gray-100 animate-pulse" />
			)}
			{imageComponent}
		</div>
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
	aspectRatio = "square",
	objectFit = "cover",
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
			aspectRatio={aspectRatio}
			objectFit={objectFit}
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
	objectFit = "contain",
	...props
}: SmartImageProps) {
	return (
		<SmartImage
			src={src}
			alt={alt}
			width={width}
			height={height}
			className={cn(className)}
			fallbackText="Logo"
			objectFit={objectFit}
			{...props}
		/>
	);
}

/**
 * Avatar-specific smart image with circular shape
 */
export function AvatarImage({
	src,
	alt,
	size = 40,
	className,
	...props
}: Omit<SmartImageProps, "width" | "height"> & { size?: number }) {
	return (
		<SmartImage
			src={src}
			alt={alt}
			width={size}
			height={size}
			className={cn("rounded-full", className)}
			fallbackText={alt.charAt(0).toUpperCase()}
			aspectRatio="square"
			{...props}
		/>
	);
}

/**
 * Banner-specific smart image with wide aspect ratio
 */
export function BannerImage({
	src,
	alt,
	className,
	...props
}: SmartImageProps) {
	return (
		<SmartImage
			src={src}
			alt={alt}
			className={cn("w-full", className)}
			fallbackText="Banner"
			aspectRatio="video"
			fill
			{...props}
		/>
	);
}
