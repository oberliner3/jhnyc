import { type NextRequest, NextResponse } from "next/server";
import { encode } from "msgpack-javascript";
import { loadProducts } from "@/lib/msgpack-loader";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search") || undefined;
		const vendor = searchParams.get("vendor") || undefined; // Note: may not be supported by external API
		const limit = Number(searchParams.get("limit")) || 20;
		const page = Number(searchParams.get("page")) || 1;
		// Note: fields parameter may not be supported by external API

		console.log(`🔍 Loading products from external API: limit=${limit}, page=${page}, search=${search || 'none'}`);

		// Use optimized MessagePack loader with SSR context
		const products = await loadProducts({
			limit,
			page,
			search,
			context: 'ssr'
		});

		// TODO: Handle vendor filtering client-side if external API doesn't support it
		let filteredProducts = products;
		if (vendor) {
			filteredProducts = products.filter(p => 
				p.vendor?.toLowerCase() === vendor.toLowerCase()
			);
		}

		const responseData = {
			products: filteredProducts,
			page,
			limit,
			total: filteredProducts.length,
			hasMore: products.length === limit, // Simple heuristic
		};

		// Check if client accepts MessagePack response
		const acceptHeader = request.headers.get("Accept");
		if (acceptHeader?.includes("application/x-msgpack")) {
			const encodedData = encode(responseData);
			const jsonSize = new TextEncoder().encode(JSON.stringify(responseData)).length;
			const compressionRatio = jsonSize / encodedData.length;
			const savings = ((1 - encodedData.length / jsonSize) * 100).toFixed(1);
			
			console.log(`📦 Sending MessagePack products response - Compression: ${savings}% (${jsonSize}B → ${encodedData.length}B)`);
			
			const response = new NextResponse(encodedData, {
				headers: { 
					"Content-Type": "application/x-msgpack",
					"X-Compression-Ratio": compressionRatio.toFixed(2),
					"X-Compression-Savings": `${savings}%`,
					"X-Original-Size": jsonSize.toString(),
					"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600", // 5 min cache, 10 min stale
				},
			});
			return response;
		}

		// Standard JSON response with caching
		const response = NextResponse.json(responseData);
		response.headers.set(
			"Cache-Control",
			"public, s-maxage=300, stale-while-revalidate=600"
		);

		console.log(`📄 Sending JSON products response: ${filteredProducts.length} products`);
		return response;
	} catch (error) {
		console.error(
			"[API] Failed to fetch products from external API:",
			error
		);
		return NextResponse.json(
			{ 
				error: "Failed to fetch products",
				products: [],
				page: 1,
				limit: 20,
				total: 0,
				hasMore: false,
			},
			{ status: 500 }
		);
	}
}

export async function POST() {
	// Placeholder for creating a new product (admin only)
	return NextResponse.json(
		{ message: "Product creation not implemented" },
		{ status: 501 },
	);
}
