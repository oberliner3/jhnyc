import { NextRequest, NextResponse } from "next/server";

const OLD_HOSTS = ["jhuangnyc.com", "www.jhuangnyc.com"];
const TARGET_HOST = "www.vohovintage.shop";

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const hostname = nextUrl.hostname;
  const pathname = nextUrl.pathname;

  // 🚫 Prevent redirect loops — if already on target host, skip
  if (hostname === TARGET_HOST) {
    return NextResponse.next();
  }

  // 🚀 Redirect old domains to new with /p prefix (except paths already under /p/)
  if (OLD_HOSTS.includes(hostname) && !pathname.startsWith("/p/")) {
    const newUrl = new URL(request.url);

    newUrl.hostname = TARGET_HOST;
    newUrl.pathname = "/p" + pathname; // add /p prefix

    return NextResponse.redirect(newUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  // ✅ Match all routes except Next.js internals and static assets
  matcher: ["/((?!api|_next|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)"],
};
