/**
 * Google Merchant Feed (Legacy Route - Redirects to Consolidated System)
 * @deprecated Use /api/feed?publisher=google instead
 */

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Redirect to the new consolidated feed system
  const url = new URL("/api/feed", request.url);
  url.searchParams.set("publisher", "google");
  
  return Response.redirect(url.toString(), 301);
}

