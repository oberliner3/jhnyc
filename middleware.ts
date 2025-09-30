import { NextResponse } from "next/server";

/**
 * NOTE:
 * Next.js middleware cannot read or modify the response body. The previous
 * implementation attempted to fetch the current request and inject HTML,
 * which can cause runtime stream errors and recursion. We now safely pass
 * through and handle any customization within proper route handlers/pages.
 */
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: "/checkouts/:path*",
};
