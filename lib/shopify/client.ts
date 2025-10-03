export async function createDraftOrder(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  console.log("Creating draft order with data:", data);
  return { invoiceUrl: "https://example.com/invoice/123" };
}