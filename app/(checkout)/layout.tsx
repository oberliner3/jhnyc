import { PageLayout } from "@/components/layout/page-layout";

/**
 * Checkout Layout
 * Minimal layout for checkout pages - no header or footer.
 * Provides a distraction-free checkout experience.
 */
export default function CheckoutLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<PageLayout showHeader={false} showFooter={false} showAnnouncement={false}>
			<main className="flex-grow">{children}</main>
		</PageLayout>
	);
}
