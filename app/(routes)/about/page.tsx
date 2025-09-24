import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { generateSEO } from "@/lib/seo";
export const metadata: Metadata = generateSEO({
	title: "About Us",
	description:
		"Learn about our mission, values, and commitment to providing exceptional products and service.",
	path: "/about",
});

export default function AboutPage() {
	return (
		<div className="px-4 py-8 container">
			<div className="mx-auto max-w-4xl">
				<h1 className="mb-8 font-bold text-3xl lg:text-4xl tracking-tight">
					About {SITE_CONFIG.name}
				</h1>

				<div className="max-w-none prose prose-lg">
					<p className="mb-8 text-muted-foreground text-xl">
						We&apos;re passionate about bringing you the finest products with
						exceptional quality and unmatched service.
					</p>

					<div className="gap-8 grid md:grid-cols-2 mb-12">
						<div>
							<h2 className="mb-4 font-bold text-2xl">Our Mission</h2>
							<p className="text-muted-foreground">
								To curate and deliver premium products that enhance your
								lifestyle while providing an exceptional shopping experience
								built on trust, quality, and customer satisfaction.
							</p>
						</div>
						<div>
							<h2 className="mb-4 font-bold text-2xl">Our Values</h2>
							<ul className="space-y-2 text-muted-foreground">
								<li>• Quality craftsmanship in every product</li>
								<li>• Sustainable and ethical sourcing</li>
								<li>• Exceptional customer service</li>
								<li>• Innovation and continuous improvement</li>
							</ul>
						</div>
					</div>

					<h2 className="mb-4 font-bold text-2xl">Why Choose Us?</h2>
					<p className="mb-6 text-muted-foreground">
						With over a decade of experience in e-commerce, we understand what
						matters most to our customers. From carefully selected products to
						lightning-fast shipping and hassle-free returns, we&apos;re
						committed to exceeding your expectations at every step.
					</p>
				</div>
			</div>
		</div>
	);
}
