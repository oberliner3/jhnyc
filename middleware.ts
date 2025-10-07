import { NextRequest, NextResponse } from "next/server";

const OLD_HOSTS = ["jhuangnyc.com", "www.jhuangnyc.com"];
const TARGET_HOST = "www.vohovintage.shop";

// 🧠 Utility: check if path is a static asset
function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?|ttf|txt|xml|json)$/i)
  );
}

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const hostname = nextUrl.hostname;
  const pathname = nextUrl.pathname;

  // 🛑 Prevent redirect loops — if already on target domain or inside /p/
  if (hostname === TARGET_HOST || pathname.startsWith("/p/")) {
    return NextResponse.next();
  }

  // 🚫 Skip all static and internal files
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // 🚀 Redirect jhuangnyc.com → vohovintage.shop/p/<path>
  if (OLD_HOSTS.includes(hostname)) {
    const newUrl = new URL(request.url);
    newUrl.hostname = TARGET_HOST;
    newUrl.pathname = "/p" + pathname;
    return NextResponse.redirect(newUrl, 308);
  }

  // ✅ Default: proceed as normal
  return NextResponse.next();
}

// ✅ Match all public routes except static files and internal paths
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?|ttf|txt|xml|json)$).*)",
  ],
};
