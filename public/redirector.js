// public/redirector.js
// Domain protection script for jhuangnyc.com
(function () {
  "use strict";

  const PROXY_DOMAIN = "www.vohovintage.shop";

  function isInIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  function isLegitimateParent() {
    try {
      const referrer = document.referrer;
      if (!referrer) return false;
      const referrerUrl = new URL(referrer);
      return referrerUrl.hostname.includes("vohovintage.shop");
    } catch (e) {
      return false;
    }
  }

  function protectDomain() {
    const hostname = window.location.hostname;

    // Skip on localhost
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      console.log("[Redirector] Development mode - skipping");
      return;
    }

    // This should only run on jhuangnyc.com
    if (!hostname.includes("jhuangnyc.com")) {
      console.log("[Redirector] Not on origin domain - skipping");
      return;
    }

    const inIframe = isInIframe();
    const legitimateParent = isLegitimateParent();

    console.log("[Redirector] Status:", {
      hostname,
      inIframe,
      legitimateParent,
      pathname: window.location.pathname,
      referrer: document.referrer.substring(0, 50),
    });

    // Case 1: Direct access (not in iframe) - redirect to proxy
    if (!inIframe) {
      console.warn(
        "[Redirector] Direct access detected - redirecting to proxy"
      );

      const path =
        window.location.pathname === "/" ? "" : window.location.pathname;

      const proxyUrl = `https://${PROXY_DOMAIN}/p${path}${window.location.search}${window.location.hash}`;

      console.log("[Redirector] Redirecting to:", proxyUrl);

      // Use replace to prevent back-button loops
      window.location.replace(proxyUrl);
      return;
    }

    // Case 2: In legitimate iframe (from vohovintage.shop)
    if (inIframe && legitimateParent) {
      console.log("[Redirector] In legitimate iframe - allowed");
      // This is expected - do nothing
      return;
    }

    // Case 3: In unauthorized iframe - break out
    if (inIframe && !legitimateParent) {
      console.warn("[Redirector] Unauthorized iframe detected - breaking out");

      const path = window.location.pathname;
      const breakoutUrl = `https://${PROXY_DOMAIN}/p${path}${window.location.search}`;

      try {
        // Try to redirect the top window
        if (window.top) {
          window.top.location.href = breakoutUrl;
        }
      } catch (e) {
        // If we can't access top, redirect our frame
        window.location.replace(breakoutUrl);
      }
      return;
    }
  }

  // Monitor for attempts to remove this script
  function monitorForAttacks() {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (node) {
          if (
            node.id === "domain-redirect" ||
            (node.tagName === "SCRIPT" &&
              node.src &&
              node.src.includes("redirector"))
          ) {
            console.error(
              "[Redirector] Protection script removed - re-running checks"
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
  }

  // Initialize immediately
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", protectDomain);
  } else {
    protectDomain();
  }

  // Start monitoring for tampering
  monitorForAttacks();

  // Periodic re-check (every 5 seconds)
  if (window.domainProtectInterval) {
    clearInterval(window.domainProtectInterval);
  }
  window.domainProtectInterval = setInterval(protectDomain, 5000);

  console.log("[Redirector] Protection initialized");
})();
