import { type NextRequest, NextResponse } from "next/server";
import { encode } from "msgpack-javascript";
import { loadProductByHandle } from "@/lib/msgpack-loader";

export async function GET(
	request: NextRequest,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	context: any,
) {
	try {
		const { handle } = (await context.params);

		// Use optimized MessagePack loader with SSR context
		const product = await loadProductByHandle(handle, { context: 'ssr' });

		if (!product) {
			return NextResponse.json({ error: "Product not found" }, { status: 404 });
		}

		const acceptHeader = request.headers.get("Accept");
		if (acceptHeader && acceptHeader.includes("application/x-msgpack")) {
			const encodedData = encode(product);
			const response = new NextResponse(encodedData, {
				headers: { "Content-Type": "application/x-msgpack" },
			});
			response.headers.set(
				"Cache-Control",
				"public, s-maxage=60, stale-while-revalidate=300",
			);
			return response;
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
