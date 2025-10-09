// Cloudflare Worker for vohovintage.shop
// Creates iframe wrapper for jhuangnyc.com content
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetOrigin = "https://jhuangnyc.com";
    const targetHost = "jhuangnyc.com";
    const proxyHost = url.host; // vohovintage.shop

    // === 1. Path Handling ===
    let targetPath = url.pathname;
    let isProxyPath = false;

    // Check if URL has /p/ prefix
    if (url.pathname.startsWith("/p/") || url.pathname === "/p") {
      isProxyPath = true;
      targetPath = url.pathname.replace(/^\/p/, "") || "/";
    } else if (url.pathname === "/") {
      // Root path - redirect to /p/
      return Response.redirect(`${url.origin}/p/`, 307);
    } else {
      // No /p/ prefix - redirect to /p/ version
      return Response.redirect(
        `${url.origin}/p${url.pathname}${url.search}`,
        307
      );
    }

    // For /p/* paths, return iframe wrapper HTML
    const iframeHtml = generateIframeWrapper(
      targetOrigin,
      targetPath,
      url.search,
      url.hash
    );

    return new Response(iframeHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      // /  "X-Frame-Options": "DENY", // Prevent this wrapper from being iframed
        "Content-Security-Policy":
          "frame-src https://jhuangnyc.com https://www.jhuangnyc.com; frame-ancestors 'self' https://vohovintage.shop https://www.vohovintage.shop https://maa7ha-jh.myshopify.com/",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  },
};

/**
 * Generate HTML that iframes the origin domain
 * No postMessage needed - iframe uses window.top.location directly
 */
function generateIframeWrapper(origin, path, search, hash) {
  const iframeSrc = `${origin}${path}${search}${hash}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VoHo Vintage</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      height: 100%;
      overflow: hidden;
      background: #fff;
    }
    
    #origin-frame {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
    
    /* Loading state */
    #loading {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      z-index: 9999;
      transition: opacity 0.3s ease;
    }
    
    #loading.hidden {
      opacity: 0;
      pointer-events: none;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #333;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <!-- Loading indicator -->
  <div id="loading">
    <div class="spinner"></div>
  </div>
  
  <!-- Origin iframe -->
  <iframe
    id="origin-frame"
    src="${iframeSrc}"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; payment"
    allowfullscreen
    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
    title="VoHo Vintage Store"
  ></iframe>

  <script>
    (function() {
      'use strict';
      
      const iframe = document.getElementById('origin-frame');
      const loading = document.getElementById('loading');
      
      // Hide loading indicator when iframe loads
      iframe.addEventListener('load', function() {
        setTimeout(() => {
          loading.classList.add('hidden');
        }, 300);
      });
      
      // Optional: Listen for messages as fallback (if window.top.location fails)
      window.addEventListener('message', function(event) {
        const ALLOWED_ORIGINS = ['https://jhuangnyc.com', 'https://www.jhuangnyc.com'];
        
        if (!ALLOWED_ORIGINS.includes(event.origin)) {
          return;
        }
        
        // Fallback: handle checkout redirect via postMessage
        if (event.data?.type === 'checkout' && event.data.checkoutUrl) {
          console.log('[Proxy Wrapper] Fallback postMessage redirect:', event.data.checkoutUrl);
          window.location.href = event.data.checkoutUrl;
        }
      });
      
      console.log('[Proxy Wrapper] Initialized - iframe src:', iframe.src);
      console.log('[Proxy Wrapper] Checkout will redirect via window.top.location');
    })();
  </script>
</body>
</html>`;
}
