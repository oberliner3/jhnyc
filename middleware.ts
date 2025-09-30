import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // const isDev = process.env.NODE_ENV === "development";

  // const cspHeader = `
  //   default-src 'self' data:;
  //   script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${
  //   isDev ? "'unsafe-eval'" : ""
  // } https://va.vercel-scripts.com;
  //   style-src 'self' 'nonce-${nonce}' 'unsafe-inline';
  //   img-src 'self' blob: data: https: http:;
  //   font-src 'self' data:;
  //   object-src 'none';
  //   base-uri 'self';
  //   form-action 'self' https://checkout.stripe.com https://checkout.shopify.com;
  //   frame-ancestors 'none';
  //   ${!isDev ? "upgrade-insecure-requests;" : ""}
  //   connect-src 'self' https: wss: ${
  //     isDev ? "http: ws:" : ""
  //   } https://vitals.vercel-insights.com https://api.placeholder.com;
  //   media-src 'self' blob: data: https: http:;
  //   worker-src 'self' blob:;
  //   child-src 'self' blob:;
  // `;

  const requestHeaders = new Headers(request.headers);
  // requestHeaders.set("x-nonce", nonce);
  // requestHeaders.set(
  //   "Content-Security-Policy",
  //   cspHeader.replace(/\s{2,}/g, " ").trim()
  // );

  return NextResponse.next({
    headers: requestHeaders,
  });
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
