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
	return <main className="flex-grow">{children}</main>;
}
