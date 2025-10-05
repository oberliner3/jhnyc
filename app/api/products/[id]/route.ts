import { type NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/data/products";

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	const { id } = await context.params;
	try {

		// Use generic product loader that returns JSON
		const product = await getProductById(id, { context: "ssr" });

		if (!product) {
			return NextResponse.json({ error: "Product not found" }, { status: 404 });
		}

		// Add cache control headers
		const response = NextResponse.json(product);
		response.headers.set(
			"Cache-Control",
			"public, s-maxage=60, stale-while-revalidate=300",
		);

		return response;
	} catch (error) {
		console.error(
			`[API] Failed to fetch product with id ${id} from external API:`,
			error,
		);
		return NextResponse.json(
			{ error: "Failed to fetch product" },
			{ status: 500 },
		);
	}
}
