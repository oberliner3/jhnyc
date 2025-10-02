import { ServerPageLayout } from "@/components/layout/page-layout-wrapper";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServerPageLayout showHeader={false} showFooter={false} showAnnouncement={false}>
      <main className="flex-grow">{children}</main>
    </ServerPageLayout>
  );
}