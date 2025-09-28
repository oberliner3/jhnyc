import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountGate } from "@/components/account/account-gate";
import { AccountDashboardSkeleton } from "@/components/skeletons/account-skeleton";
import { generateSEO } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
	title: "Account",
	description: "Manage your account settings and view your orders.",
	path: "/account",
});

export default function AccountPage() {
	return (
		<Suspense fallback={<AccountDashboardSkeleton />}>
			<AccountGate />
		</Suspense>
	);
}
