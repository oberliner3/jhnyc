import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

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
		<>
			<AnnouncementBar />
			<Header />
			<main className="flex-grow">{children}</main>
			<Footer />
		</>
	);
}
