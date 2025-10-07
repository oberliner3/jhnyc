import { notFound } from "next/navigation";
import { ClientSuccessPage } from "./client-success-page";

interface PageProps {
  searchParams: Promise<{ order?: string }>; // Type it as Promise
}

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams; // Await to unwrap the Promise
  const orderId = resolvedSearchParams.order;

  // Optional: Validate or fetch server-side data here
  if (!orderId) {
    notFound();
  }

  return <ClientSuccessPage orderId={orderId} />;
}
