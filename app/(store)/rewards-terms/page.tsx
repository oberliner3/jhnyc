import type { Metadata } from "next";
import { APP_CONTACTS } from "@/lib/constants";
import { generateSEO } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
	title: "Rewards Terms",
	description: "Terms and conditions for our customer rewards program.",
	path: "/rewards-terms",
});

export default function RewardsTermsPage() {
	return (
		<div className="px-4 py-8 container">
			<div className="mx-auto max-w-4xl">
				<h1 className="mb-8 font-bold text-3xl lg:text-4xl tracking-tight">
					Rewards Program Terms & Conditions
				</h1>

				<div className="space-y-8 max-w-none prose prose-lg">
					<p className="text-muted-foreground">Last updated: January 1, 2025</p>

					<section>
						<h2 className="mb-4 font-bold text-2xl">Program Overview</h2>
						<p className="text-muted-foreground">
							Our Rewards Program is designed to thank our loyal customers.
							Members earn points on eligible purchases, which can be redeemed
							for discounts and exclusive offers.
						</p>
					</section>

					<section>
						<h2 className="mb-4 font-bold text-2xl">Earning Points</h2>
						<ul className="space-y-2 pl-6 text-muted-foreground list-disc">
							<li>Earn 1 point for every $1 spent on eligible products.</li>
							<li>Bonus points may be offered during special promotions.</li>
							<li>
								Points are credited to your account after your order has
								shipped.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="mb-4 font-bold text-2xl">Redeeming Points</h2>
						<ul className="space-y-2 pl-6 text-muted-foreground list-disc">
							<li>100 points can be redeemed for a $5 discount.</li>
							<li>Points can be redeemed at checkout.</li>
							<li>Minimum redemption thresholds may apply.</li>
						</ul>
					</section>

					<section>
						<h2 className="mb-4 font-bold text-2xl">
							Program Changes and Termination
						</h2>
						<p className="text-muted-foreground">
							We reserve the right to modify or terminate the Rewards Program at
							any time, with or without notice. Any changes will be posted on
							this page.
						</p>
					</section>

					<section>
						<h2 className="mb-4 font-bold text-2xl">Contact Us</h2>
						<p className="text-muted-foreground">
							If you have any questions about the Rewards Program, please
							contact us at {APP_CONTACTS.email.rewards}.
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
