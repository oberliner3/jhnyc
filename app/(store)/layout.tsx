import { ServerPageLayout } from "@/components/layout/page-layout-wrapper";


export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServerPageLayout>
      <main className="flex-grow">{children}</main>
    </ServerPageLayout>
  );
}
