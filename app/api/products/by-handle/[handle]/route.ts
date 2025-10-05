import { type NextRequest, NextResponse } from "next/server";
import { getProductByHandle } from "@/lib/data/products";

export async function GET(
	request: NextRequest,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	context: any,
) {
	try {
		const { handle } = (await context.params);

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
			`[API] Failed to fetch product with handle ${(await context.params).handle} from external API:`,
			error,
		);
		return NextResponse.json(
			{ error: "Failed to fetch product" },
			{ status: 500 },
		);
	}
}
