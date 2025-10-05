import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data/products";
import { SITE_CONFIG } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	try {
		const products = await getProducts({ limit: 10000 });

		// Core pages
		const corePages: MetadataRoute.Sitemap = [
			{
				url: SITE_CONFIG.url,
				lastModified: new Date(),
				changeFrequency: "daily",
				priority: 1.0,
			},
			{
				url: `${SITE_CONFIG.url}/collections/all`,
				lastModified: new Date(),
				changeFrequency: "daily",
				priority: 0.9,
			},
			{
				url: `${SITE_CONFIG.url}/search`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.8,
			},
		];

		// E-commerce pages
		const ecommercePages: MetadataRoute.Sitemap = [
			{
				url: `${SITE_CONFIG.url}/cart`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.7,
			},
			{
				url: `${SITE_CONFIG.url}/checkout`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.6,
			},
			{
				url: `${SITE_CONFIG.url}/checkout/success`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.3,
			},
		];

		// Account pages (public access)
		const accountPages: MetadataRoute.Sitemap = [
			{
				url: `${SITE_CONFIG.url}/account`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.5,
			},
			{
				url: `${SITE_CONFIG.url}/account/orders`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.4,
			},
			{
				url: `${SITE_CONFIG.url}/account/addresses`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.3,
			},
			{
				url: `${SITE_CONFIG.url}/account/wishlist`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.4,
			},
			{
				url: `${SITE_CONFIG.url}/account/settings`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.3,
			},
		];

		// Information pages
		const infoPages: MetadataRoute.Sitemap = [
			{
				url: `${SITE_CONFIG.url}/about`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.8,
			},
			{
				url: `${SITE_CONFIG.url}/contact`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.7,
			},
			{
				url: `${SITE_CONFIG.url}/faq`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.6,
			},
			{
				url: `${SITE_CONFIG.url}/help`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.6,
			},
			{
				url: `${SITE_CONFIG.url}/size-guide`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.5,
			},
			{
				url: `${SITE_CONFIG.url}/care-instructions`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.4,
			},
		];

		// Shipping & Support pages
		const supportPages: MetadataRoute.Sitemap = [
			{
				url: `${SITE_CONFIG.url}/shipping-delivery`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.6,
			},
			{
				url: `${SITE_CONFIG.url}/returns-exchange`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.6,
			},
			{
				url: `${SITE_CONFIG.url}/refund-policy`,
				lastModified: new Date(),
				changeFrequency: "yearly",
				priority: 0.4,
			},
			{
				url: `${SITE_CONFIG.url}/track-order`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.5,
			},
			{
				url: `${SITE_CONFIG.url}/customer-service`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.5,
			},
		];

		// Legal pages
		const legalPages: MetadataRoute.Sitemap = [
			{
				url: `${SITE_CONFIG.url}/privacy-policy`,
				lastModified: new Date(),
				changeFrequency: "yearly",
				priority: 0.3,
			},
			{
				url: `${SITE_CONFIG.url}/terms-of-service`,
				lastModified: new Date(),
				changeFrequency: "yearly",
				priority: 0.3,
			},
			{
				url: `${SITE_CONFIG.url}/cookie-policy`,
				lastModified: new Date(),
				changeFrequency: "yearly",
				priority: 0.2,
			},
			{
				url: `${SITE_CONFIG.url}/accessibility-statement`,
				lastModified: new Date(),
				changeFrequency: "yearly",
				priority: 0.2,
			},
		];

		// Blog/Content pages (if they exist)
		const contentPages: MetadataRoute.Sitemap = [
			{
				url: `${SITE_CONFIG.url}/blog`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.6,
			},
			{
				url: `${SITE_CONFIG.url}/news`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.5,
			},
			{
				url: `${SITE_CONFIG.url}/press`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.4,
			},
			{
				url: `${SITE_CONFIG.url}/careers`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.4,
			},
		];

		// Special pages
		const specialPages: MetadataRoute.Sitemap = [
			{
				url: `${SITE_CONFIG.url}/offline`,
				lastModified: new Date(),
				changeFrequency: "yearly",
				priority: 0.1,
			},
			{
				url: `${SITE_CONFIG.url}/404`,
				lastModified: new Date(),
				changeFrequency: "yearly",
				priority: 0.1,
			},
			{
				url: `${SITE_CONFIG.url}/sitemap.xml`,
				lastModified: new Date(),
				changeFrequency: "daily",
				priority: 0.8,
			},
			{
				url: `${SITE_CONFIG.url}/robots.txt`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.5,
			},
		];

		// API endpoints for crawlers (if needed)
		const apiPages: MetadataRoute.Sitemap = [
			{
				url: `${SITE_CONFIG.url}/api/feed/google-merchant`,
				lastModified: new Date(),
				changeFrequency: "daily",
				priority: 0.7,
			},
		];

		// Combine all static pages
		const staticPages: MetadataRoute.Sitemap = [
			...corePages,
			...ecommercePages,
			...accountPages,
			...infoPages,
			...supportPages,
			...legalPages,
			...contentPages,
			...specialPages,
			...apiPages,
		];

		// Product pages with enhanced metadata
		const productEntries: MetadataRoute.Sitemap = products.map((product) => {
			// Determine priority based on product status and type
			let priority = 0.7; // Default priority

			if (product.in_stock) priority += 0.1; // Boost for in-stock items
			if (product.compare_at_price && product.compare_at_price > product.price)
				priority += 0.1; // Boost for sale items
			if (product.rating && product.rating >= 4) priority += 0.1; // Boost for highly rated items

			// Cap priority at 0.9 (below homepage)
			priority = Math.min(priority, 0.9);

			return {
				url: `${SITE_CONFIG.url}/products/${product.handle}`,
				lastModified: new Date(
					product.updated_at || product.created_at || new Date(),
				),
				changeFrequency: "weekly" as const,
				priority: priority,
			};
		});

		// Category/Collection pages (if you have them)
		const categoryPages: MetadataRoute.Sitemap = [
			{
				url: `${SITE_CONFIG.url}/collections/all`,
				lastModified: new Date(),
				changeFrequency: "daily",
				priority: 0.8,
			},
			{
				url: `${SITE_CONFIG.url}/collections/featured`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.7,
			},
			{
				url: `${SITE_CONFIG.url}/collections/sale`,
				lastModified: new Date(),
				changeFrequency: "daily",
				priority: 0.8,
			},
			{
				url: `${SITE_CONFIG.url}/collections/new`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.7,
			},
		];

		// Combine all pages
		const allPages: MetadataRoute.Sitemap = [
			...staticPages,
			...categoryPages,
			...productEntries,
		];

		// Sort by priority (highest first) for better crawling
		allPages.sort((a, b) => (b.priority || 0) - (a.priority || 0));

		console.log(
			`Generated sitemap with ${allPages.length} pages (${productEntries.length} products)`,
		);

		return allPages;
	} catch (error) {
		console.error("Error generating sitemap:", error);

		// Return comprehensive fallback sitemap if product fetch fails
		const fallbackPages: MetadataRoute.Sitemap = [
			{
				url: SITE_CONFIG.url,
				lastModified: new Date(),
				changeFrequency: "daily",
				priority: 1.0,
			},
			{
				url: `${SITE_CONFIG.url}/products`,
				lastModified: new Date(),
				changeFrequency: "daily",
				priority: 0.9,
			},
			{
				url: `${SITE_CONFIG.url}/search`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.8,
			},
			{
				url: `${SITE_CONFIG.url}/about`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.8,
			},
			{
				url: `${SITE_CONFIG.url}/contact`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.7,
			},
			{
				url: `${SITE_CONFIG.url}/cart`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.7,
			},
			{
				url: `${SITE_CONFIG.url}/checkout`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.6,
			},
			{
				url: `${SITE_CONFIG.url}/shipping-delivery`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.6,
			},
			{
				url: `${SITE_CONFIG.url}/returns-exchange`,
				lastModified: new Date(),
				changeFrequency: "monthly",
				priority: 0.6,
			},
			{
				url: `${SITE_CONFIG.url}/privacy-policy`,
				lastModified: new Date(),
				changeFrequency: "yearly",
				priority: 0.3,
			},
			{
				url: `${SITE_CONFIG.url}/terms-of-service`,
				lastModified: new Date(),
				changeFrequency: "yearly",
				priority: 0.3,
			},
		];

		console.log(`Using fallback sitemap with ${fallbackPages.length} pages`);
		return fallbackPages;
	}
}
