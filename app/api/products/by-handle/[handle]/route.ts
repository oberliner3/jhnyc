import { type NextRequest, NextResponse } from "next/server";
import { getProductByHandle } from "@/lib/data/products";

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ handle: string }> },
) {
	try {
		const { handle } = await context.params;

		// Use generic product loader that returns JSON
		const product = await getProductByHandle(handle, { context: 'ssr' });

		if (!product) {
			return NextResponse.json({ error: "Product not found" }, { status: 404 });
		}

		const response = NextResponse.json(product);
		response.headers.set(
			"Cache-Control",
			"public, s-maxage=60, stale-while-revalidate=300",
		);

		return response;
	} catch (error) {
		console.error(
			`[API] Failed to fetch product with handle from external API:`,
			error,
		);
		return NextResponse.json(
			{ error: "Failed to fetch product" },
			{ status: 500 },
		);
	}
}
