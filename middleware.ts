import { NextRequest, NextResponse } from "next/server";

const OLD_HOSTS = ["jhuangnyc.com", "www.jhuangnyc.com"];
const TARGET_HOST = "www.vohovintage.shop";

export function middleware(request: NextRequest) {
  const { nextUrl, headers } = request;
  const hostname = nextUrl.hostname;
  const pathname = nextUrl.pathname;

  // Skip redirect if already on target host
  if (hostname === TARGET_HOST) return NextResponse.next();

  // Skip redirect if request comes from Cloudflare Worker
  if (headers.get("x-proxied") === "1") return NextResponse.next();

  // Redirect old domains to /p/... on target host
  if (OLD_HOSTS.includes(hostname) && !pathname.startsWith("/p/")) {
    const newUrl = new URL(request.url);
    newUrl.hostname = TARGET_HOST;
    newUrl.pathname = "/p" + pathname;

    // Optional: simple loading page before redirect
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Loading...</title>
        <script>
          setTimeout(()=>{ window.location.href=${JSON.stringify(newUrl.toString())}; }, 500);
        </script>
      </head>
      <body>
        <p>Redirecting...</p>
      </body>
      </html>
    `;
    return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html" } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml)).*)"],
};
