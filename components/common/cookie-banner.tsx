'use client'

import CookieConsent from 'react-cookie-consent'

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
      containerClasses="w-full border-t bg-background"
      contentClasses="container px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      buttonWrapperClasses="flex items-center gap-3"
      buttonClasses="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4"
      declineButtonClasses="inline-flex items-center justify-center whitespace-nowrap rounded-md border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4"
      style={{ boxShadow: '0 -1px 0 var(--border)' }}
      onAccept={() => {
        const consent = buildConsent(true)
        document.cookie = `originz-cookie-consent=${encodeURIComponent(JSON.stringify(consent))};path=/;max-age=${60 * 60 * 24 * 180};SameSite=Lax`;
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('consent', 'update', {
            ad_storage: 'granted',
            analytics_storage: 'granted',
          })
        }
      }}
      onDecline={() => {
        const consent = buildConsent(false)
        document.cookie = `originz-cookie-consent=${encodeURIComponent(JSON.stringify(consent))};path=/;max-age=${60 * 60 * 24 * 180};SameSite=Lax`;
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('consent', 'update', {
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
