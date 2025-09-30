"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getErrorPlaceholder } from "@/lib/placeholder";

interface PlaceholderImageProps {
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
 * Image component that properly handles placeholder images
 * Automatically uses unoptimized for SVG placeholders
 */
export function PlaceholderImage({
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
}: PlaceholderImageProps) {
	const [hasError, setHasError] = useState(false);

	// Determine if the source is a placeholder (SVG)
	const isPlaceholder = !src || src.includes("placeholdit.com") || hasError;

	// Get the final image source
	const imageSrc = hasError
		? getErrorPlaceholder(fallbackText || alt, width, height)
		: src || getErrorPlaceholder(fallbackText || alt, width, height);

	const handleError = () => {
		setHasError(true);
		onError?.();
	};

	if (fill) {
		return (
			<Image
				src={imageSrc}
				alt={alt}
				fill
				className={cn("object-cover", className)}
				sizes={sizes || "100vw"}
				priority={priority}
				quality={quality}
				onError={handleError}
				unoptimized={isPlaceholder}
			/>
		);
	}

	return (
		<Image
			src={imageSrc}
			alt={alt}
			width={width || 800}
			height={height || 800}
			className={cn("object-cover", className)}
			priority={priority}
			quality={quality}
			onError={handleError}
			unoptimized={isPlaceholder}
		/>
	);
}
