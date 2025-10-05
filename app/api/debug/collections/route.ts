import { NextResponse } from "next/server";
import { env } from "@/lib/env-validation";
import { loadDataOptimized } from "@/lib/msgpack-loader";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const collection = searchParams.get("collection") || "featured";

	try {
		// Test environment variables

		const envInfo = {
      hasApiUrl: !!env.COSMOS_API_BASE_URL,
      hasApiKey: !!env.COSMOS_API_KEY,
      apiUrl:
        env.COSMOS_API_BASE_URL?.replace(/(^https?:\/\/[^/]+).*/, "$1/***") ||
        "undefined",
      keyLength: env.COSMOS_API_KEY?.length || 0,
    };

		console.log(`🔍 Debug: Testing collection "${collection}"`);
		console.log(`🔧 Environment:`, envInfo);

		// Test the collections endpoint
		const collectionData = await loadDataOptimized<{
			products?: Array<{ title?: string; [key: string]: unknown }>;
			meta?: {
				total?: number;
				page?: number;
				limit?: number;
				total_pages?: number;
			};
		}>(`/collections/${collection}?limit=5`, {
			context: "ssr",
		});

		// Test the regular products endpoint
		const productsData = await loadDataOptimized<{
			products?: Array<{ title?: string; [key: string]: unknown }>;
			meta?: {
				total?: number;
				page?: number;
				limit?: number;
				total_pages?: number;
			};
		}>("/products?limit=5", {
			context: "ssr",
		});

		return NextResponse.json({
			success: true,
			timestamp: new Date().toISOString(),
			environment: envInfo,
			collection: {
				name: collection,
				products: collectionData.products?.length || 0,
				meta: collectionData.meta || null,
				firstProduct: collectionData.products?.[0]?.title || null,
				sampleProduct: collectionData.products?.[0] || null,
			},
			regularProducts: {
				count: productsData.products?.length || 0,
				meta: productsData.meta || null,
				firstProduct: productsData.products?.[0]?.title || null,
			},
		});
	} catch (error) {
		console.error("Debug API error:", error);

		return NextResponse.json(
			{
				success: false,
				timestamp: new Date().toISOString(),
				error: error instanceof Error ? error.message : "Unknown error",
				stack: error instanceof Error ? error.stack : undefined,
			},
			{ status: 500 },
		);
	}
}
