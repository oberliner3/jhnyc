import Image from "next/image";
import { PARTNERS } from "@/lib/data/partners";

export function Partners() {
	return (
		<section className="py-16 lg:py-24">
			<div className="px-4 container">
				<div className="mb-12 text-center">
					<h2 className="mb-4 font-bold text-3xl lg:text-4xl tracking-tight">
						Trusted by Leading Brands
					</h2>
					<p className="mx-auto max-w-2xl text-muted-foreground">
						We partner with the world&apos;s most innovative companies to bring
						you the best products.
					</p>
				</div>

				<div className="flex flex-wrap justify-center items-center gap-8 opacity-60 hover:opacity-80 transition-opacity">
					{PARTNERS.map((partner) => (
						<div
							key={partner.id}
							className="grayscale hover:grayscale-0 transition-all duration-300"
						>
							<Image
								src={partner.logo}
								alt={partner.name}
								width={120}
								height={60}
								className="w-auto h-12"
								unoptimized
							/>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
