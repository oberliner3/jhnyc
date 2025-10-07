import { NextRequest, NextResponse } from "next/server";

const OLD_HOSTS = ["jhuangnyc.com", "www.jhuangnyc.com"];
const TARGET_HOST = "www.vohovintage.shop";

export function middleware(request: NextRequest) {
  const { nextUrl, headers } = request;
  const hostname = nextUrl.hostname;
  const pathname = nextUrl.pathname;

  // 🚫 Skip redirect if already on target host
  if (hostname === TARGET_HOST) return NextResponse.next();

  // ✅ Skip redirect if this request is coming from the Cloudflare Worker
  if (headers.get("x-proxied") === "1") return NextResponse.next();

  // 🚀 Redirect old domains to new host + /p prefix
  if (OLD_HOSTS.includes(hostname) && !pathname.startsWith("/p/")) {
    const newUrl = new URL(request.url);
    newUrl.hostname = TARGET_HOST;
    newUrl.pathname = "/p" + pathname;

    // Optional: Show a temporary loading page instead of instant redirect
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Loading...</title>
        <style>
          body { font-family: system-ui,sans-serif; display:flex;justify-content:center;align-items:center;height:100vh;margin:0; }
          .spinner { width:48px;height:48px;border:4px solid #ccc;border-top-color:#111;border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:1rem; }
          @keyframes spin { to { transform: rotate(360deg); } }
          p { font-size:1rem;color:#444; }
        </style>
        <script>
          setTimeout(()=>{ window.location.href=${JSON.stringify(newUrl.toString())}; }, 1000);
        </script>
      </head>
      <body>
        <div class="spinner"></div>
        <p>Loading...</p>
      </body>
      </html>
    `;
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml)).*)"],
};
