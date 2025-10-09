// public/redirector.js - CORRECTED
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
  const REDIRECT_TARGET_DOMAIN = "www.vohovintage.shop";

  function isLegitimateHost() {
    const hostname = window.location.hostname;
    return ALLOWED_DOMAINS.some((domain) => hostname.includes(domain));
  }
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
      return ALLOWED_DOMAINS.some((domain) =>
        referrerUrl.hostname.includes(domain)
      );
    } catch (e) {
      console.warn("[Domain Protection] Could not verify parent domain:", e);
      return false;
    }
  }
  function hasValidProxyToken() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("proxy_token");
    return token === "your-secret-token-here";
  }

  function protectDomain() {
    // --- CHANGE HIGHLIGHT: Primary check to prevent execution on the proxy domain ---
    const isProxyDomain = window.location.hostname.includes("vohovintage.shop");

    if (isProxyDomain) {
      console.log(
        "[Domain Protection] Running on proxy domain. Halting execution."
      );
      return; // Exit immediately
    }

    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      console.log("[Domain Protection] Development mode - skipping checks");
      return;
    }

    const inIframe = isInIframe();
    const isJhuangnyc = window.location.hostname.includes("jhuangnyc.com");

    // --- CHANGE HIGHLIGHT: Simplified and more robust redirect logic ---
    // If on the origin domain (jhuangnyc.com) and not in a legitimate iframe context, redirect.
    if (isJhuangnyc && !inIframe) {
      console.warn(
        "[Domain Protection] Direct access on jhuangnyc.com detected, redirecting to proxy..."
      );
      const path =
        window.location.pathname === "/" ? "" : window.location.pathname;
      const newUrl = `https://${REDIRECT_TARGET_DOMAIN}/p${path}${window.location.search}${window.location.hash}`;
      window.location.replace(newUrl);
      return;
    }

    // The rest of this logic primarily handles unauthorized iframe embedding.
    const legitimateHost = isLegitimateHost();
    const legitimateParent = isLegitimateParent();
    const validToken = hasValidProxyToken();

    console.log("[Domain Protection] Status:", {
      inIframe,
      legitimateHost,
      legitimateParent,
      validToken,
      hostname: window.location.hostname,
    });

    // Case: In iframe but parent is not authorized (Security breakout)
    if (inIframe && !legitimateParent && !validToken) {
      console.warn(
        "[Domain Protection] Unauthorized iframe parent, breaking out..."
      );
      try {
        if (window.top) {
          window.top.location.href = window.location.href;
        }
      } catch (e) {
        window.location.replace(
          "https://" + LEGITIMATE_DOMAIN + window.location.pathname
        );
      }
    }
  }

  // Monitor for DOM manipulation (unchanged)
  function monitorForAttacks() {
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
  }

  // Run protection logic
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", protectDomain);
  } else {
    protectDomain();
  }

  monitorForAttacks();

  // Clear any existing intervals to prevent loops from old code, then set a new one.
  if (window.domainProtectInterval) {
    clearInterval(window.domainProtectInterval);
  }
  window.domainProtectInterval = setInterval(protectDomain, 5000);

  console.log("[Domain Protection] Initialized");
})();
