// Cloudflare Worker - Mapped to: /p/*, /_next/*, /cdn/shop/*, /* (ALL paths)
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetOrigin = "https://jhuangnyc.com";
    const targetHost = "jhuangnyc.com";

    // --- 1. Determine Target Path and HTML Status ---
    const path = url.pathname;
    let targetPath = path;
    let isHTMLPage = false;

    // Determine if the client requested the content via the /p/ prefix.
    const requestedWithPrefix = path.startsWith("/p/");

    if (requestedWithPrefix) {
      // Strip /p/ ONLY for the request sent to the origin (jhuangnyc.com)
      targetPath = path.replace(/^\/p/, "") || "/";
      isHTMLPage = !path.match(
        /\.(js|css|woff2|woff|ttf|eot|ico|png|jpg|jpeg|gif|svg|json|map|txt)$/i
      );
    } else {
      // All other root-level paths (assets, API fetches, etc.) are proxied as-is.
      targetPath = path;
      isHTMLPage = !path.match(
        /\.(js|css|woff2|woff|ttf|eot|ico|png|jpg|jpeg|gif|svg|json|map|txt)$/i
      );
    }

    const targetUrl = `${targetOrigin}${targetPath}${url.search}`;

    // --- 2. Request Headers & Proxied Request ---
    const headers = new Headers(request.headers);

    // CRITICAL: Set the Host header to the original domain (jhuangnyc.com)
    // This is crucial for Next.js/Vercel to resolve internal routing correctly.
    headers.set("Host", targetHost);

    // Ensure the origin knows the request came via HTTPS.
    headers.set("X-Forwarded-Proto", "https");

    // Security/Proxy Token
    headers.set("x-proxy-token", env.PROXY_SECRET_TOKEN);

    // Tell the origin which host the *client* is viewing (vohovintage.shop)
    headers.set("x-forwarded-host", url.host);

    // Set other standard proxy headers
    headers.set("Origin", url.origin);

    const proxiedReq = new Request(targetUrl, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : request.body,
      redirect: "manual", // Needed for manual 3xx handling
    });

    // Handle OPTIONS preflight requests
    if (request.method === "OPTIONS") {
      const optionsHeaders = new Headers();
      optionsHeaders.set("Access-Control-Allow-Origin", "*");
      optionsHeaders.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      optionsHeaders.set(
        "Access-Control-Allow-Headers",
        request.headers.get("Access-Control-Request-Headers") || "*"
      );
      optionsHeaders.set("Access-Control-Max-Age", "86400");
      return new Response(null, { status: 204, headers: optionsHeaders });
    }

    const res = await fetch(proxiedReq);
    const contentType = res.headers.get("content-type") || "";
    const newHeaders = new Headers(res.headers);

    // --- 3. Handle External & Internal Redirects (CRITICAL LOOP FIX) ---
    if (res.status >= 300 && res.status < 400) {
      const redirectUrl = res.headers.get("location");
      if (!redirectUrl) {
        return new Response(null, { status: res.status, headers: newHeaders });
      }

      // Check if the redirect is to an external host (e.g., Shopify checkout)
      const isExternalRedirect = !redirectUrl.startsWith(targetOrigin);

      if (isExternalRedirect) {
        // EXTERNAL redirect (e.g., to Shopify checkout)
        // Use script injection to redirect the parent window safely.
        const scriptResponse = new Response(
          `<script>window.top.location.href = "${redirectUrl}";</script>`,
          { status: 200, headers: { "Content-Type": "text/html" } }
        );
        return scriptResponse;
      } else {
        // INTERNAL redirect (from jhuangnyc.com to jhuangnyc.com, e.g., /product -> /product/slug)

        // If the original client request came with /p/, we MUST rewrite the location header
        // to put the /p/ back on the front, forcing the browser to follow the redirect
        // through the Worker again, preventing the user from landing directly on jhuangnyc.com.
        if (requestedWithPrefix) {
          const pathComponent = new URL(redirectUrl).pathname;
          const rewrittenRedirectUrl = url.origin + "/p" + pathComponent;
          newHeaders.set("location", rewrittenRedirectUrl);
        }

        // Enable CORS for all redirects (safety measure)
        newHeaders.set("Access-Control-Allow-Origin", "*");

        // FIX FOR REDIRECT LOOP: Return the response with NULL body.
        // This ensures the browser *strictly* follows the rewritten Location header.
        return new Response(null, { status: res.status, headers: newHeaders });
      }
    }

    // --- 4. Header & MIME Type Management ---

    if (isHTMLPage) {
      // CSP settings for HTML pages
      newHeaders.set(
        "Content-Security-Policy",
        `default-src 'self' https://${targetHost} https://www.${targetHost};frame-ancestors *;connect-src *;img-src * data: blob:;script-src 'self' 'unsafe-inline' 'unsafe-eval' https://${targetHost} https://www.${targetHost};style-src 'self' 'unsafe-inline' https://${targetHost} https://www.${targetHost};`.replace(
          /\s+/g,
          " "
        )
      );
    } else {
      // CORS Fix for all assets/APIs
      newHeaders.set("Access-Control-Allow-Origin", "*");
      newHeaders.delete("X-Frame-Options");
      newHeaders.delete("Content-Security-Policy");

      // MIME Type Fix (in case origin misconfigures them)
      if (path.endsWith(".css") && !contentType.includes("text/css")) {
        newHeaders.set("Content-Type", "text/css; charset=utf-8");
      } else if (
        path.endsWith(".js") &&
        !contentType.includes("application/javascript")
      ) {
        newHeaders.set("Content-Type", "application/javascript; charset=utf-8");
      }
    }

    newHeaders.set("x-proxied-by", "vohovintage.shop");
    newHeaders.delete("Content-Length");

    // --- 5. Checkout Script Injection (for HTML only) ---
    if (isHTMLPage && contentType.includes("text/html")) {
      // ... (HTML Rewriter logic remains the same for postMessage)
      const IframeMessageInjector = {
        element(element) {
          element.before(
            `<script>
                            window.addEventListener("message", (event) => {
                                // Only process messages from the target domain
                                if (!["${url.origin}","https://www.${url.host}"].includes(event.origin)) return;
                                
                                if (event.data?.type === "checkout" && event.data.checkoutUrl) {
                                    console.log("[Worker Frame] Redirecting parent to:", event.data.checkoutUrl);
                                    window.top.location.href = event.data.checkoutUrl;
                                }
                            });
                        </script>`,
            { html: true }
          );
        },
      };

      const rewriter = new HTMLRewriter().on("body", IframeMessageInjector);

      return rewriter.transform(
        new Response(res.body, {
          status: res.status,
          headers: newHeaders,
        })
      );
    }

    // --- 6. Return Asset/API Response ---
    return new Response(res.body, {
      status: res.status,
      headers: newHeaders,
    });
  },
};
