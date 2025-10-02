import { ShowNewsletterOnce } from "@/components/common/show-newsletter-once";
import { PageLayout } from "@/components/layout/page-layout";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { Hero } from "@/components/sections/hero";
import { InfoSections } from "@/components/sections/info-sections";
import { Partners } from "@/components/sections/partners";
import { Reviews } from "@/components/sections/reviews";
import { generateSEO } from "@/lib/seo";

export const revalidate = 60;

export const metadata = generateSEO({
	title: "Premium E-Commerce Store",
	description:
		"Discover premium products with exceptional quality and service. Shop our curated collection of the latest trends and timeless classics.",
});

export default function HomePage() {
	return (
		<PageLayout>
			<Hero />
			<FeaturedProducts />
			<InfoSections />
			<Partners />
			<Reviews />
			<ShowNewsletterOnce />
		</PageLayout>
	);
}
