/**
 * Bing Merchant Feed Index (Legacy Route - Redirects to Consolidated System)
 * @deprecated Use /api/feed/index?publisher=bing instead
 */

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Redirect to the new consolidated feed index system
  const url = new URL("/api/feed/index", request.url);
  url.searchParams.set("publisher", "bing");

  return Response.redirect(url.toString(), 301);
}

export const revalidate = 3600;
