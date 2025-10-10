/**
 * Bing Merchant Feed (Legacy Route - Redirects to Consolidated System)
 * @deprecated Use /api/feed?publisher=bing instead
 */

import { NextRequest } from "next/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  // Redirect to the new consolidated feed system
  const url = new URL("/api/feed", request.url);
  url.searchParams.set("publisher", "bing");
  
  return Response.redirect(url.toString(), 301);
}
