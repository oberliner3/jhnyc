import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_PROXY_DOMAINS = [
  "vohovintage.shop",
  "www.vohovintage.shop",
  "jhuangnyc.com",
  "www.jhuangnyc.com",
  "localhost",
];

const PROXY_SECRET_TOKEN = process.env.PROXY_SECRET_TOKEN;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") || "";
  const referer = req.headers.get("referer") || "";
  const origin = req.headers.get("origin") || "";
  const xProxyToken = req.headers.get("x-proxy-token") || "";

  const isProxied = !!xProxyToken;

  if (isProxied && xProxyToken !== PROXY_SECRET_TOKEN) {
    return new NextResponse("Unauthorized proxy", { status: 403 });
  } // Optional: restrict _next and API access to allowed referers or proxy

  if (pathname.startsWith("/_next/") || pathname.startsWith("/api/")) {
    const validAccess =
      isProxied ||
      ALLOWED_PROXY_DOMAINS.some(
        (d) => referer.includes(d) || origin.includes(d)
      );
    if (!validAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  } // CSP headers (frame-ancestors: *)

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", "frame-ancestors *;");

  return response;
}

export const config = {
  matcher: ["/((?!_next/image|favicon.ico).*)"],
};
