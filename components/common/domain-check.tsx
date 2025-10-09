// components/common/domain-check.tsx
'use client';

import { useEffect } from 'react';

const ALLOWED_DOMAINS = [
  'jhuangnyc.com',
  'www.jhuangnyc.com',
  'vohovintage.shop',
  'www.vohovintage.shop',
];

export function DomainCheck() {
  useEffect(() => {
    // Skip in development
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    const currentHost = window.location.hostname;
    
    // Check if we're on an allowed domain
    const isAllowedDomain = ALLOWED_DOMAINS.some(domain => 
      currentHost.includes(domain)
    );

    if (!isAllowedDomain) {
      console.warn('[DomainCheck] Unauthorized domain detected:', currentHost);
      window.location.replace(`https://jhuangnyc.com${window.location.pathname}`);
      return;
    }

    // Check if in iframe
    const inIframe = window.self !== window.top;
    
    if (inIframe) {
      const referrer = document.referrer;
      const isAllowedReferrer = ALLOWED_DOMAINS.some(domain => 
        referrer.includes(domain)
      );

      if (!isAllowedReferrer) {
        console.warn('[DomainCheck] Unauthorized iframe embedding detected');
        
        // Try to break out of unauthorized iframe
        try {
          window.top!.location.href = window.location.href;
        } catch (e) {
          // If blocked by same-origin policy, redirect self
          window.location.replace(`https://jhuangnyc.com${window.location.pathname}`);
        }
      } else {
        console.log('[DomainCheck] Legitimate iframe embedding from:', referrer);
      }
    }
  }, []);

  return null; // This component doesn't render anything
}