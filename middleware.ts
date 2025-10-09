import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROXY_DOMAINS = [
  "vohovintage.shop",
  "www.vohovintage.shop",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") || "";
  const referer = req.headers.get("referer") || "";

  // Skip on localhost
  if (host.includes("localhost")) {
    return NextResponse.next();
  }

  // Check if request is coming from the proxy (iframe)
  const isFromProxy = PROXY_DOMAINS.some(domain => referer.includes(domain));

  console.log("[Origin Middleware]", {
    host,
    pathname,
    isFromProxy,
    referer: referer.substring(0, 50),
  });

  const response = NextResponse.next();

  if (isFromProxy) {
    // Request is from iframe on vohovintage.shop - allow embedding
    response.headers.set(
      "Content-Security-Policy",
      "frame-ancestors https://vohovintage.shop https://www.vohovintage.shop;"
    );
    response.headers.delete("X-Frame-Options");
    
    // Add header to indicate we're in iframe mode
    response.headers.set("X-Iframe-Mode", "true");
  } else {
    // Direct access - let redirector handle it
    response.headers.set(
      "Content-Security-Policy",
      "frame-ancestors 'none';"
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};