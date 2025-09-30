import { ShowNewsletterOnce } from "@/components/common/show-newsletter-once";
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
    <div className="mx-auto container">
      <Hero />
      <FeaturedProducts />
      <InfoSections />
      <Partners />
      <Reviews />
      <ShowNewsletterOnce />
    </div>
  );
}
