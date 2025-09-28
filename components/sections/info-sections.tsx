import { Headphones, RefreshCw, Shield, Truck } from "lucide-react";

const FEATURES = [
	{
		icon: Shield,
		title: "Secure Shopping",
		description:
			"Your payment information is protected with bank-level security",
	},
	{
		icon: Truck,
		title: "Free Shipping",
		description:
			"Free shipping on all orders over $50 within the continental US",
	},
	{
		icon: RefreshCw,
		title: "Easy Returns",
		description: "30-day hassle-free returns and exchanges on all items",
	},
	{
		icon: Headphones,
		title: "24/7 Support",
		description: "Our customer service team is here to help you anytime",
	},
];

export function InfoSections() {
	return (
		<section className="bg-muted/30 py-16 lg:py-24">
			<div className="px-4 container">
				<div className="mb-12 text-center">
					<h2 className="mb-4 font-bold text-3xl lg:text-4xl tracking-tight">
						Why Shop With Us?
					</h2>
					<p className="mx-auto max-w-2xl text-muted-foreground">
						We&apos;re committed to providing the best shopping experience with
						premium quality products and exceptional service.
					</p>
				</div>

				<div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
					{FEATURES.map((feature) => (
						<div
							key={feature.title}
							className="bg-background hover:shadow-md p-6 border rounded-lg text-center transition-all"
						>
							<div className="flex justify-center items-center bg-primary/10 mx-auto mb-4 rounded-lg w-12 h-12">
								<feature.icon className="w-6 h-6 text-primary" />
							</div>
							<h3 className="mb-2 font-semibold">{feature.title}</h3>
							<p className="text-muted-foreground text-sm">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
