import * as clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: clsx.ClassValue[]) {
	return twMerge(clsx.clsx(inputs));
}

export const DEFAULT_UTM_PARAMS = {
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "buy-now",
} as const;

export type UTMParams = Partial<typeof DEFAULT_UTM_PARAMS>;

export function mergeUtmParams(utm?: UTMParams) {
  return { ...DEFAULT_UTM_PARAMS, ...utm };
}

export function formatPrice(price: number, currency = "USD") {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
	}).format(price);
}

export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/**
 * Generate placeholder image URL using placeholdit.com
 * Following the app's theme with proper colors
 */
export function generatePlaceholderImage({
	width = 800,
	height = 600,
	text = "Image",
	bgColor,
	textColor,
	fontSize = 48,
	font = "montserrat",
}: {
	width?: number;
	height?: number;
	text?: string;
	bgColor?: string;
	textColor?: string;
	fontSize?: number;
	font?: string;
} = {}): string {
	// Default colors based on app theme
	const defaultBg = "f3f4f6"; // gray-100 equivalent
	const defaultText = "374151"; // gray-700 equivalent

	const bg = bgColor || defaultBg;
	const fg = textColor || defaultText;
	const encodedText = encodeURIComponent(text);

	return `https://placeholdit.com/${width}x${height}/${bg}/${fg}?text=${encodedText}&font=${font}&font_size=${fontSize}`;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use generatePlaceholderImage instead
 */
export function generateImage({
	dim,
	bg,
	fg,
	text,
}: {
	dim: {
		w: number;
		h: number;
	};
	bg: string | number;
	fg: string | number;
	text: string;
}): string {
	return generatePlaceholderImage({
		width: dim.w,
		height: dim.h,
		text,
		bgColor: String(bg),
		textColor: String(fg),
	});
}

/**
 * Safely normalize product tags to a consistent array format
 *
 * Handles multiple input formats:
 * - Comma-separated string: "tag1, tag2, tag3" → ["tag1", "tag2", "tag3"]
 * - Array: ["tag1", "tag2"] → ["tag1", "tag2"]
 * - null/undefined → []
 * - Empty string → []
 *
 * This prevents runtime crashes when tags are in unexpected formats.
 *
 * @param tags - Product tags in any supported format
 * @returns Array of trimmed, non-empty tag strings
 *
 * @example
 * ```typescript
 * normalizeProductTags("tag1, tag2, tag3") // ["tag1", "tag2", "tag3"]
 * normalizeProductTags(["tag1", "tag2"]) // ["tag1", "tag2"]
 * normalizeProductTags(null) // []
 * normalizeProductTags("") // []
 * ```
 */
export function normalizeProductTags(
	tags: string | string[] | null | undefined
): string[] {
	// Handle null/undefined
	if (!tags) return [];

	// Handle array format
	if (Array.isArray(tags)) {
		return tags.map((tag) => tag.trim()).filter(Boolean);
	}

	// Handle string format
	if (typeof tags === "string") {
		// Empty string check
		if (tags.trim() === "") return [];

		// Split by comma and clean up
		return tags
			.split(",")
			.map((tag) => tag.trim())
			.filter(Boolean);
	}

	// Fallback for unexpected types
	return [];
}

// Re-export from xml-utils for backward compatibility
export { stripHtml, escapeXml } from "./utils/xml-utils";
