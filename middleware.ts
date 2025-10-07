// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const OLD_HOSTS = ["jhuangnyc.com", "www.jhuangnyc.com"]; // ← adjust to your old host(s)
const TARGET_HOST = "www.vohovintage.shop";            // ← adjust to your target host

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?|ttf|txt|xml|json)$/i)
  );
}

export function middleware(request: NextRequest) {
  const { nextUrl, headers } = request;
  const hostname = nextUrl.hostname;
  const pathname = nextUrl.pathname;

  // 1) Safety: do not touch static assets or API calls
  if (isStaticAsset(pathname)) return NextResponse.next();

  // 2) If the worker/proxy already flagged this request, skip (prevents loops)
  if (headers.get("x-proxied") === "1") return NextResponse.next();

  // 3) If already under /p/ on any host → nothing to do
  if (pathname.startsWith("/p/")) return NextResponse.next();

  // 4) If host is either an OLD_HOST or TARGET_HOST, serve client-side redirect HTML
  //    (this preserves hash / fragment and executes the same link rewriting JS)
  if (OLD_HOSTS.includes(hostname) || hostname === TARGET_HOST) {
    // Build the same JS snippet you had, but parameterized
    const oldHostChecks = [...OLD_HOSTS, TARGET_HOST]
      .map(h => `window.location.hostname === ${JSON.stringify(h)}`)
      .join(" || ");

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Redirecting...</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial;padding:2rem;background:#fff;color:#111}
  .spinner{width:36px;height:36px;border:4px solid #e6e6e6;border-top-color:#111;border-radius:50%;animation:spin .8s linear infinite;margin:18px auto}
  @keyframes spin{to{transform:rotate(360deg)}}
</style>
<script>
/* === Instant redirect (preserve hash/search) — matches your original snippet === */
(function(){
  if (${oldHostChecks}) {
    if (!window.location.pathname.startsWith("/p/")) {
      var pathWithSearch = window.location.pathname + window.location.search + window.location.hash;
      var newURL = ${JSON.stringify(`https://${TARGET_HOST}/p`)} + pathWithSearch;
      // use replace to avoid extra history entry
      window.location.replace(newURL);
    }
  }
})();

/* === After DOM loaded: fix all <a> links to force reverse-proxy domain with /p prefix === */
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('a[href]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var href = link.getAttribute('href');
      if (!href) return;

      // 1. Let go_checkout links work normally
      if (href.includes('go_checkout')) return;

      // 2. Let quantity buttons work normally (these class names from your snippet)
      if (link.classList.contains('botiga-quantity-minus') || link.classList.contains('botiga-quantity-plus')) {
        return;
      }

      // 3. For all other links → force reverse proxy domain with /p prefix
      e.preventDefault();
      try {
        var url = new URL(href, window.location.origin);

        // preserve links that already point to our proxy target host
        if (url.hostname === ${JSON.stringify(TARGET_HOST)}) {
          if (!url.pathname.startsWith('/p/')) {
            url.pathname = '/p' + url.pathname;
          }
        } else {
          // force target host
          url.hostname = ${JSON.stringify(TARGET_HOST)};
          if (!url.pathname.startsWith('/p/')) {
            url.pathname = '/p' + url.pathname;
          }
        }

        window.location.href = url.toString();
      } catch (err) {
        // fallback: navigate to raw href
        window.location.href = href;
      }
    });
  });
});
</script>
</head>
<body>
  <div style="max-width:36ch;margin:8vh auto;text-align:center">
    <div class="spinner" aria-hidden="true"></div>
    <p>Loading…</p>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // default: pass through
  return NextResponse.next();
}

export const config = {
  // match page requests (skip next internals and typical static file extensions)
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?|ttf|txt|xml|json)$).*)",
  ],
};
