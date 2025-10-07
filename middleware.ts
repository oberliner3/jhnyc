import { NextRequest, NextResponse } from "next/server";

const OLD_HOSTS = ["jhuangnyc.com", "www.jhuangnyc.com"]; // old domain
const TARGET_HOST = "www.vohovintage.shop";                // Shopify domain (with Worker)

function isStaticAsset(path: string) {
  return (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.match(/\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?|ttf|txt|xml|json)$/i)
  );
}

export function middleware(req: NextRequest) {
  const { nextUrl, headers } = req;
  const hostname = nextUrl.hostname;
  const pathname = nextUrl.pathname;

  // Skip assets and internal routes
  if (isStaticAsset(pathname)) return NextResponse.next();

  // ✅ Skip requests coming from the Cloudflare Worker
  if (headers.get("x-proxied") === "1") return NextResponse.next();

//   // ✅ Skip already under /p or /p/
//   if (pathname === "/p" || pathname.startsWith("/p/")) return NextResponse.next();

//   // ✅ Only redirect if on old domain or same domain without /p
//   if (OLD_HOSTS.includes(hostname) || hostname === TARGET_HOST) {
//     const oldHostChecks = OLD_HOSTS.map(h => `window.location.hostname === "${h}"`).join(" || ");

//     const html = `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="utf-8" />
//   <meta name="viewport" content="width=device-width,initial-scale=1" />
//   <title>Redirecting...</title>
//   <style>
//     body { font-family: system-ui, sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; margin:0; background:#fff; color:#111; }
//     .spinner { width:40px; height:40px; border:4px solid #ccc; border-top-color:#111; border-radius:50%; animation:spin 0.8s linear infinite; margin-bottom:1rem; }
//     @keyframes spin { to { transform:rotate(360deg); } }
//   </style>
// </head>
// <body>
//   <div class="spinner"></div>
//   <script>
//     (function() {
//       if (${oldHostChecks}) {
//         if (!window.location.pathname.startsWith("/p/")) {
//           var pathWithSearch = window.location.pathname + window.location.search + window.location.hash;
//           var newURL = "https://${TARGET_HOST}/p" + pathWithSearch;
//           window.location.replace(newURL);
//         }
//       }
//     })();
//   </script>
// </body>
// </html>`;

//     return new NextResponse(html, {
//       status: 200,
//       headers: { "Content-Type": "text/html; charset=utf-8" },
//     });
//   }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?|ttf|txt|xml|json)$).*)",
  ],
};
