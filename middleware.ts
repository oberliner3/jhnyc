// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const SHOPIFY_HOST = "www.vohovintage.shop";

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // Skip if already /p/ (Shopify path)
  if (pathname.startsWith("/p/")) return NextResponse.next();

  // Redirect old paths to Shopify /p/... URL
  const newUrl = new URL(request.url);
  newUrl.hostname = SHOPIFY_HOST;
  newUrl.pathname = "/p" + pathname;

  return NextResponse.redirect(newUrl, 308);
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
