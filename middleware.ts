import { NextRequest, NextResponse } from "next/server";

const OLD_HOSTS = ["jhuangnyc.com", "www.jhuangnyc.com"];
const TARGET_HOST = "www.vohovintage.shop";
const ROOT_DOMAIN = "vohovintage.shop";

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const hostname = nextUrl.hostname;
  const pathname = nextUrl.pathname;

  // 🚫 Prevent loops if already on the target host
  if (hostname === TARGET_HOST) {
    return NextResponse.next();
  }

  // 🌐 Normalize root domain → www version
  if (hostname === ROOT_DOMAIN) {
    const newUrl = new URL(request.url);
    newUrl.hostname = TARGET_HOST;
    return NextResponse.redirect(newUrl, 308);
  }

  // 🚀 Redirect old hosts → new domain with /p prefix
  if (OLD_HOSTS.includes(hostname) && !pathname.startsWith("/p/")) {
    const newUrl = new URL(request.url);
    newUrl.hostname = TARGET_HOST;
    newUrl.pathname = "/p" + pathname;
    return NextResponse.redirect(newUrl, 308);
  }

  return NextResponse.next();
}

// ✅ Match all public-facing routes, skip static assets and internal paths
export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml)).*)"],
};
