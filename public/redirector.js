// public/redirector.js
// Domain protection and iframe verification
(function () {
  "use strict";

  const ALLOWED_DOMAINS = [
    "jhuangnyc.com",
    "www.jhuangnyc.com",
    "vohovintage.shop",
    "www.vohovintage.shop",
    "localhost",
  ];

  const LEGITIMATE_DOMAIN = "jhuangnyc.com";
  const REDIRECT_TARGET_DOMAIN = "www.vohovintage.shop"; // 1. Check if current domain is legitimate

  function isLegitimateHost() {
    const hostname = window.location.hostname;
    return ALLOWED_DOMAINS.some((domain) => hostname.includes(domain));
  } // 2. Check if running in iframe

  function isInIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      // If we can't access window.top due to cross-origin, we're likely in an iframe
      return true;
    }
  } // 3. Verify parent domain if in iframe

  function isLegitimateParent() {
    try {
      const referrer = document.referrer;
      if (!referrer) return false;
      const referrerUrl = new URL(referrer);
      return ALLOWED_DOMAINS.some((domain) =>
        referrerUrl.hostname.includes(domain)
      );
    } catch (e) {
      console.warn("[Domain Protection] Could not verify parent domain:", e);
      return false;
    }
  } // 4. Check for proxy token in URL (from Cloudflare Worker)

  function hasValidProxyToken() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("proxy_token"); // This should match your PROXY_SECRET_TOKEN
    return token === "your-secret-token-here";
  } // 5. Main protection logic

  function protectDomain() {
    // Skip checks in development
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      console.log("[Domain Protection] Development mode - skipping checks");
      return;
    }

    const inIframe = isInIframe();
    const legitimateHost = isLegitimateHost();
    const legitimateParent = isLegitimateParent();
    const validToken = hasValidProxyToken(); // --- NEW REDIRECTION LOGIC START (FIXED) ---

    const isJhuangnyc =
      window.location.hostname === "jhuangnyc.com" ||
      window.location.hostname === "www.jhuangnyc.com";
    const isProductPath = window.location.pathname.startsWith("/p/"); // Redirection rule: // If on jhuangnyc.com AND not in an iframe AND the path does NOT start with /p/

    if (isJhuangnyc && !inIframe && !isProductPath) {
      console.warn(
        "[Domain Protection] Non-product path on jhuangnyc detected, redirecting to vohovintage.shop..."
      ); // FIX: If the path is the root '/', set 'path' to '/' so the target is /p/ // Otherwise, use the existing pathname.

      const path =
        window.location.pathname === "/" ? "/" : window.location.pathname;

      const newUrl = `https://${REDIRECT_TARGET_DOMAIN}/p${path}${window.location.search}${window.location.hash}`; // Examples of the fix: // jhuangnyc.com/  -->  path = '/', newUrl = https://www.vohovintage.shop/p/ // jhuangnyc.com/about --> path = '/about', newUrl = https://www.vohovintage.shop/p/about

      window.location.replace(newUrl);
      return; // Stop further execution
    } // --- NEW REDIRECTION LOGIC END ---
    console.log("[Domain Protection] Status:", {
      inIframe,
      legitimateHost,
      legitimateParent,
      validToken,
      hostname: window.location.hostname,
      referrer: document.referrer,
    }); // Case 1: Not in iframe but on wrong domain

    if (!inIframe && !legitimateHost) {
      console.warn(
        "[Domain Protection] Unauthorized domain detected, redirecting..."
      );
      window.location.replace(
        "https://" + LEGITIMATE_DOMAIN + window.location.pathname
      );
      return;
    } // Case 2: In iframe but parent is not authorized

    if (inIframe && !legitimateParent && !validToken) {
      console.warn(
        "[Domain Protection] Unauthorized iframe parent, breaking out..."
      ); // Try to break out of the iframe
      try {
        if (window.top) {
          window.top.location.href = window.location.href;
        }
      } catch (e) {
        // If we can't access window.top, redirect self
        window.location.replace(
          "https://" + LEGITIMATE_DOMAIN + window.location.pathname
        );
      }
      return;
    } // Case 3: Valid embedding from vohovintage.shop

    if (inIframe && (legitimateParent || validToken)) {
      console.log("[Domain Protection] Legitimate iframe embedding detected"); // Enable postMessage communication
      window.addEventListener("message", function (event) {
        // Verify origin
        if (!ALLOWED_DOMAINS.some((domain) => event.origin.includes(domain))) {
          console.warn(
            "[Domain Protection] Ignored message from unauthorized origin:",
            event.origin
          );
          return;
        }
        console.log(
          "[Domain Protection] Received message from parent:",
          event.data
        );
      });
    }
  } // 6. Additional protection: Monitor for DOM manipulation

  function monitorForAttacks() {
    // Detect if someone tries to remove this script
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (node) {
          if (node.id === "domain-redirect") {
            console.error(
              "[Domain Protection] Protection script removed! Re-running checks..."
            );
            protectDomain();
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  } // 7. Prevent console tampering in production

  function protectConsole() {
    if (window.location.hostname !== "localhost") {
      const noop = function () {};
      const methods = ["log", "debug", "info", "warn"];
      methods.forEach((method) => {
        const original = console[method];
        console[method] = function (...args) {
          // Still log but prevent tampering
          if (typeof original === "function") {
            original.apply(console, args);
          }
        };
      });
    }
  } // 8. Run protection on load

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", protectDomain);
  } else {
    protectDomain();
  } // Monitor for attacks

  monitorForAttacks(); // Protect console (optional)
  protectConsole(); // Run checks periodically (every 5 seconds)
  setInterval(protectDomain, 5000);

  console.log("[Domain Protection] Initialized");
})();
