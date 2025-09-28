import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductDetailsSkeleton } from "@/components/skeletons/product-details-skeleton";
import { getAllProducts, getProductByHandle } from "@/lib/api";
import { SITE_CONFIG } from "@/lib/constants";
import { generateSEO } from "@/lib/seo";
import { ProductDetailsServer } from "./product-details-server";

export const revalidate = 60;

interface ProductPageProps {
	params: { slug: string };
}

export async function generateStaticParams() {
	try {
		const products = await getAllProducts({ limit: 100 });
		return products.filter((p) => p.handle).map((p) => ({ slug: p.handle }));
	} catch {
		return [] as { slug: string }[];
	}
}

export async function generateMetadata({
	params,
}: ProductPageProps): Promise<Metadata> {
	try {
		const product = await getProductByHandle(params.slug);

		if (!product) {
			return generateSEO({ title: "Product Not Found" });
		}

		const seoImage = product.images?.[0]?.src || SITE_CONFIG.ogImage;

		return generateSEO({
			title: product.title || "",
			description: product.body_html || "",
			path: `/products/${product.handle || params.slug}`,
			type: "product",
			image: seoImage,
		});
	} catch {
		return generateSEO({ title: "Product Not Found" });
	}
}

export default function ProductPage({ params }: ProductPageProps) {
	const { slug } = params;

	return (
		<Suspense fallback={<ProductDetailsSkeleton />}>
			<ProductDetailsServer slug={slug} />
		</Suspense>
	);
}
