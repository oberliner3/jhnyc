import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define your source + target hostnames
const OLD_HOSTS = ["jhuangnyc.com", "www.jhuangnyc.com"];
const TARGET_HOST = "www.vohovintage.shop";

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const hostname = nextUrl.hostname;
  const pathname = nextUrl.pathname;

  // 🚀 If coming from an old host (mknst.com / www.mknst.com)
  // and not already under /p/, redirect to new domain + /p prefix
  if (OLD_HOSTS.includes(hostname) && !pathname.startsWith("/p/")) {
    const newUrl = new URL(request.url);

    newUrl.hostname = TARGET_HOST;
    newUrl.pathname = "/p" + pathname; // add /p prefix

    return NextResponse.redirect(newUrl, 308);
  }

  return NextResponse.next();
}

// ✅ Run middleware for all routes
export const config = {
  matcher: ["/:path*"],
};
