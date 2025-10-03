import DraftOrderForm from "@/components/admin/draft-order-form";

export const dynamic = "force-dynamic";

export default function DraftOrdersPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <DraftOrderForm />
    </div>
  );
}
