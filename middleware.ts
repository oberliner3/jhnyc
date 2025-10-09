// middleware.ts - Enhanced with reverse proxy detection
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Whitelist of allowed domains that can proxy/embed your site
const ALLOWED_PROXY_DOMAINS = [
  "vohovintage.shop",
  "www.vohovintage.shop",
  "jhuangnyc.com",
  "www.jhuangnyc.com",
  "localhost", // for development
];

// Secret token that vohovintage.shop worker will send
const PROXY_SECRET_TOKEN = process.env.PROXY_SECRET_TOKEN || "your-secret-token-here";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") || "";
  const referer = req.headers.get("referer") || "";
  const origin = req.headers.get("origin") || "";
  const xForwardedHost = req.headers.get("x-forwarded-host") || "";
  const proxyToken = req.headers.get("x-proxy-token") || "";

  // 1. REVERSE PROXY DETECTION
  // Check if the request is coming through a proxy
  const isProxied = xForwardedHost && xForwardedHost !== host;

  if (isProxied) {
    console.log(`[Middleware] Proxied request detected:`, {
      originalHost: host,
      forwardedHost: xForwardedHost,
      referer,
      hasToken: !!proxyToken,
    });

    // Verify the proxy is authorized
    const isAllowedProxy = ALLOWED_PROXY_DOMAINS.some(
      (domain) => xForwardedHost.includes(domain)
    );

    // Check for secret token (vohovintage.shop worker should send this)
    const hasValidToken = proxyToken === PROXY_SECRET_TOKEN;

    if (!isAllowedProxy && !hasValidToken) {
      console.warn(`[Middleware] BLOCKED unauthorized proxy: ${xForwardedHost}`);
      
      // Return a page that breaks when proxied
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head><title>Access Denied</title></head>
        <body>
          <h1>Unauthorized Access</h1>
          <p>This site cannot be accessed through unauthorized proxies.</p>
          <script>
            // Break out of unauthorized iframes
            if (window.top !== window.self) {
              window.top.location = window.self.location;
            }
            // Detect if domain doesn't match
            if (!window.location.hostname.includes('jhuangnyc.com')) {
              window.location.href = 'https://jhuangnyc.com';
            }
          </script>
        </body>
        </html>
        `,
        { 
          status: 403,
          headers: {
            "Content-Type": "text/html",
            "X-Frame-Options": "DENY",
          }
        }
      );
    }
  }

  // 2. DOMAIN VERIFICATION
  // Ensure requests are from allowed domains
  const isValidDomain = 
    host.includes("jhuangnyc.com") || 
    host.includes("localhost");

  const isValidReferer = 
    !referer || 
    ALLOWED_PROXY_DOMAINS.some((domain) => referer.includes(domain));

  const isValidOrigin = 
    !origin || 
    ALLOWED_PROXY_DOMAINS.some((domain) => origin.includes(domain));

  // If domain doesn't match and no valid proxy token
  if (!isValidDomain && !proxyToken) {
    console.warn(`[Middleware] Invalid domain access attempt: ${host}`);
    return NextResponse.redirect("https://jhuangnyc.com", 301);
  }

  // 3. PROTECT CRITICAL FILES
  if (pathname.startsWith("/_next/")) {
    const response = NextResponse.next();
    
    // Only allow from whitelisted domains or with valid token
    if (!isValidReferer && !proxyToken) {
      console.warn(`[Middleware] Blocked _next access from: ${referer}`);
      return new NextResponse("Forbidden", { status: 403 });
    }

    return response;
  }

  // 4. INJECT DOMAIN CHECK SCRIPT
  // For HTML pages, inject JavaScript to verify domain
  if (
    pathname.endsWith("/") || 
    pathname.match(/\.(html?)$/i) ||
    !pathname.includes(".")
  ) {
    const response = NextResponse.next();
    
    // Add header to inject domain verification script
    response.headers.set("x-inject-domain-check", "true");
    
    return response;
  }

  // 5. API ROUTE PROTECTION
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();

    // Require valid origin or proxy token for API calls
    if (!isValidOrigin && !proxyToken) {
      console.warn(`[Middleware] Blocked API access from: ${origin}`);
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 403,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Add CORS headers only for allowed domains
    if (isValidOrigin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, X-Proxy-Token");
    }

    return response;
  }

  // 6. ASSET PROTECTION
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|css|js)$/i)) {
    const response = NextResponse.next();

    // Check referer for asset requests
    if (referer && !isValidReferer && !proxyToken) {
      console.warn(`[Middleware] Potential hotlinking from: ${referer}`);
      // Optional: block or watermark
      // return new NextResponse("Forbidden", { status: 403 });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/image|favicon.ico).*)"],
};