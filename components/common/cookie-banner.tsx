'use client'

import CookieConsent from 'react-cookie-consent'

declare global {
  interface Window {
    gtag: (
      command: 'consent',
      action: 'update',
      params: {
        ad_storage: 'granted' | 'denied';
        analytics_storage: 'granted' | 'denied';
      }
    ) => void;
  }
}

// Build a structured consent payload and persist as a cookie
const buildConsent = (accepted: boolean) => ({
  necessary: true,
  performance: accepted,
  analytics: accepted,
  marketing: accepted,
  version: 1,
  ts: new Date().toISOString(),
})

export function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      enableDeclineButton
      buttonText="Accept all"
      declineButtonText="Reject non‑essential"
      cookieName="originz-cookie-consent"
      expires={180}
      containerClasses="w-full border-t bg-background z-50"
      contentClasses="container px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      buttonWrapperClasses="flex items-center gap-3"
      buttonClasses="cookie-consent-button"
      declineButtonClasses="cookie-consent-decline-button"
      style={{ boxShadow: '0 -1px 0 var(--border)' }}
      onAccept={() => {
        const consent = buildConsent(true)
        document.cookie = `originz-cookie-consent=${encodeURIComponent(JSON.stringify(consent))};path=/;max-age=${60 * 60 * 24 * 180};SameSite=Lax`;
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('consent', 'update', {
            ad_storage: 'granted',
            analytics_storage: 'granted',
          })
        }
      }}
      onDecline={() => {
        const consent = buildConsent(false)
        document.cookie = `originz-cookie-consent=${encodeURIComponent(JSON.stringify(consent))};path=/;max-age=${60 * 60 * 24 * 180};SameSite=Lax`;
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('consent', 'update', {
            ad_storage: 'denied',
            analytics_storage: 'denied',
          })
        }
      }}
    >
      <span className="text-sm text-muted-foreground">
        We use cookies to personalize content and to analyze our traffic. You can accept all or reject non‑essential cookies.
      </span>
    </CookieConsent>
  )
}
