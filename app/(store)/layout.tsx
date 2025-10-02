import { PageLayout } from "@/components/layout/page-layout";

/**
 * Store Layout
 * This layout is for all store pages that need the standard header and footer.
 * It's used by all pages in the (store) route group.
 */
export default function StoreLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<PageLayout>
			<main className="flex-grow">{children}</main>
		</PageLayout>
	);
}
