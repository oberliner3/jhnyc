/**
 * Placeholder image utilities for consistent theming across the app
 * Uses placeholdit.com for better customization
 */

interface PlaceholderConfig {
	width?: number;
	height?: number;
	text?: string;
	bgColor?: string;
	textColor?: string;
	fontSize?: number;
	font?: string;
}

// Theme-based color presets
export const PLACEHOLDER_THEMES = {
	// Product images
	product: {
		bgColor: "f3f4f6", // gray-100
		textColor: "6b7280", // gray-500
		fontSize: 48,
	},
	// Category images
	category: {
		bgColor: "e5e7eb", // gray-200
		textColor: "374151", // gray-700
		fontSize: 36,
	},
	// Avatar/Profile
	avatar: {
		bgColor: "d1d5db", // gray-300
		textColor: "4b5563", // gray-600
		fontSize: 24,
	},
	// Hero/Banner
	hero: {
		bgColor: "1f2937", // gray-800
		textColor: "f3f4f6", // gray-100
		fontSize: 64,
	},
	// Brand/Logo
	brand: {
		bgColor: "ffffff", // white
		textColor: "1f2937", // gray-800
		fontSize: 32,
	},
	// Error/Missing
	error: {
		bgColor: "fee2e2", // red-100
		textColor: "991b1b", // red-800
		fontSize: 36,
	},
} as const;

/**
 * Generate a product placeholder image
 */
export function getProductPlaceholder(
	text = "Product",
	width = 800,
	height = 800,
): string {
	const theme = PLACEHOLDER_THEMES.product;
	return generatePlaceholder({
		width,
		height,
		text,
		...theme,
	});
}

/**
 * Generate a category placeholder image
 */
export function getCategoryPlaceholder(
	text = "Category",
	width = 600,
	height = 400,
): string {
	const theme = PLACEHOLDER_THEMES.category;
	return generatePlaceholder({
		width,
		height,
		text,
		...theme,
	});
}

/**
 * Generate an avatar placeholder image
 */
export function getAvatarPlaceholder(text = "User", size = 200): string {
	const theme = PLACEHOLDER_THEMES.avatar;
	return generatePlaceholder({
		width: size,
		height: size,
		text,
		...theme,
	});
}

/**
 * Generate a hero/banner placeholder image
 */
export function getHeroPlaceholder(
	text = "Hero",
	width = 1920,
	height = 600,
): string {
	const theme = PLACEHOLDER_THEMES.hero;
	return generatePlaceholder({
		width,
		height,
		text,
		...theme,
	});
}

/**
 * Generate a brand/logo placeholder image
 */
export function getBrandPlaceholder(
	text = "Brand",
	width = 200,
	height = 100,
): string {
	const theme = PLACEHOLDER_THEMES.brand;
	return generatePlaceholder({
		width,
		height,
		text,
		...theme,
	});
}

/**
 * Core function to generate placeholder URLs
 */
export function generatePlaceholder({
	width = 800,
	height = 600,
	text = "Placeholder",
	bgColor = "f3f4f6",
	textColor = "6b7280",
	fontSize = 48,
	font = "montserrat",
}: PlaceholderConfig = {}): string {
	const encodedText = encodeURIComponent(text);
	return `https://placeholdit.com/${width}x${height}/${bgColor}/${textColor}?text=${encodedText}&font=${font}&font_size=${fontSize}`;
}

/**
 * Get placeholder for missing/error states
 */
export function getErrorPlaceholder(
	text = "Image Not Found",
	width = 800,
	height = 600,
): string {
	const theme = PLACEHOLDER_THEMES.error;
	return generatePlaceholder({
		width,
		height,
		text,
		...theme,
	});
}

/**
 * Get placeholder with custom theme colors
 */
export function getThemedPlaceholder(
	themeName: keyof typeof PLACEHOLDER_THEMES,
	text?: string,
	width?: number,
	height?: number,
): string {
	const theme = PLACEHOLDER_THEMES[themeName];
	return generatePlaceholder({
		width,
		height,
		text,
		...theme,
	});
}

// Export default placeholder for backward compatibility
export const DEFAULT_PLACEHOLDER = getProductPlaceholder("No Image", 800, 800);
