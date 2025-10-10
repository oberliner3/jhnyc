/**
 * Bing Merchant Feed Paginated (Legacy Route - Redirects to Consolidated System)
 * @deprecated Use /api/feed/pages/[page]?publisher=bing instead
 */

import { NextRequest } from "next/server";

type Context = {
  params: Promise<{ page: string }>;
};

export async function GET(request: NextRequest, context: Context) {
  const { page } = await context.params;

  // Redirect to the new consolidated paginated feed system
  const url = new URL(`/api/feed/pages/${page}`, request.url);
  url.searchParams.set("publisher", "bing");

  return Response.redirect(url.toString(), 301);
}

export const revalidate = 3600;
