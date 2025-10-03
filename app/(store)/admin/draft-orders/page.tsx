import { DraftOrderForm } from "@/components/admin/draft-order-form";

// Force dynamic rendering to prevent prerender issues
export const dynamic = 'force-dynamic';

export default function DraftOrdersPage() {
	return (
		<div className="min-h-screen bg-gray-50">
			<DraftOrderForm />
		</div>
	);
}
