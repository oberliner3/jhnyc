import type { Metadata } from "next";
import { APP_CONTACTS } from "@/lib/constants";
import { generateSEO } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
	title: "Terms of Service",
	description:
		"Read our terms and conditions for using our website and services.",
	path: "/terms-of-service",
});

export default function TermsOfServicePage() {
	return (
		<div className="px-4 py-8 container">
			<div className="mx-auto max-w-4xl">
				<h1 className="mb-8 font-bold text-3xl lg:text-4xl tracking-tight">
					Terms of Service
				</h1>

				<div className="space-y-8 max-w-none prose prose-lg">
					<p className="text-muted-foreground">Last updated: January 1, 2024</p>

					<section>
						<h2 className="mb-4 font-bold text-2xl">Acceptance of Terms</h2>
						<p className="text-muted-foreground">
							By accessing and using this website, you accept and agree to be
							bound by the terms and provision of this agreement.
						</p>
					</section>

					<section>
						<h2 className="mb-4 font-bold text-2xl">Use License</h2>
						<p className="mb-4 text-muted-foreground">
							Permission is granted to temporarily download one copy of the
							materials on our website for personal, non-commercial transitory
							viewing only.
						</p>
					</section>

					<section>
						<h2 className="mb-4 font-bold text-2xl">Disclaimer</h2>
						<p className="text-muted-foreground">
							The materials on our website are provided on an &apos;as is&apos;
							basis. We make no warranties, expressed or implied, and hereby
							disclaim and negate all other warranties including, without
							limitation, implied warranties or conditions of merchantability.
						</p>
					</section>

					<section>
						<h2 className="mb-4 font-bold text-2xl">Contact Information</h2>
						<p className="text-muted-foreground">
							Questions about the Terms of Service should be sent to us at{" "}
							{APP_CONTACTS.email.legal}.
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
