/**
 * Analytics Provider Component
 * Handles app-wide analytics initialization and consent management
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAnalyticsInit, usePageViewTracking } from '@/hooks/useAnalytics';
import type { ConsentSettings } from '@/lib/analytics/types';

interface AnalyticsContextType {
  consentGiven: boolean;
  setConsent: (consent: ConsentSettings) => void;
  hasInitialized: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  requireConsent?: boolean;
  defaultConsent?: ConsentSettings;
}

export function AnalyticsProvider({ 
  children, 
  requireConsent = true,
  defaultConsent 
}: AnalyticsProviderProps) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [currentConsent, setCurrentConsent] = useState<ConsentSettings | undefined>(defaultConsent);

  // Load consent from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConsent = localStorage.getItem('analytics_consent');
      if (savedConsent) {
        try {
          const consent = JSON.parse(savedConsent) as ConsentSettings;
          setCurrentConsent(consent);
          setConsentGiven(consent.analytics_storage === 'granted');
        } catch (error) {
          console.error('Failed to parse saved consent:', error);
        }
      } else if (!requireConsent) {
        // If consent is not required, grant basic analytics
        const basicConsent: ConsentSettings = {
          analytics_storage: 'granted',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          functionality_storage: 'granted',
          personalization_storage: 'granted',
          security_storage: 'granted',
        };
        setCurrentConsent(basicConsent);
        setConsentGiven(true);
      }
    }
  }, [requireConsent]);

  // Initialize analytics when consent is given
  useAnalyticsInit(currentConsent);

  // Enable page view tracking after initialization
  usePageViewTracking();

  useEffect(() => {
    if (currentConsent && (consentGiven || !requireConsent)) {
      setHasInitialized(true);
    }
  }, [currentConsent, consentGiven, requireConsent]);

  const setConsent = (consent: ConsentSettings) => {
    setCurrentConsent(consent);
    setConsentGiven(consent.analytics_storage === 'granted');
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_consent', JSON.stringify(consent));
    }
  };

  const contextValue: AnalyticsContextType = {
    consentGiven,
    setConsent,
    hasInitialized,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Hook to use analytics context
export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within AnalyticsProvider');
  }
  return context;
}

// Debug component for development
export function AnalyticsDebugInfo() {
  const { consentGiven, hasInitialized } = useAnalyticsContext();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace',
      }}
    >
      <div>🔍 Analytics Debug</div>
      <div>Consent: {consentGiven ? '✅' : '❌'}</div>
      <div>Initialized: {hasInitialized ? '✅' : '❌'}</div>
    </div>
  );
}