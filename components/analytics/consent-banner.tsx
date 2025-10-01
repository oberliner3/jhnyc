/**
 * Cookie Consent Banner Component
 * GDPR/CCPA compliant consent management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAnalyticsContext } from './analytics-provider';
import { useConsentManagement } from '@/hooks/useAnalytics';

interface ConsentBannerProps {
  className?: string;
  position?: 'top' | 'bottom';
  theme?: 'light' | 'dark';
}

export function ConsentBanner({ 
  className = '', 
  position = 'bottom',
  theme = 'light' 
}: ConsentBannerProps) {
  const { consentGiven, setConsent } = useAnalyticsContext();
  const { grantAllConsent, denyAllConsent, setAnalyticsOnly } = useConsentManagement();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenBanner = localStorage.getItem('consent_banner_seen');
      if (!hasSeenBanner && !consentGiven) {
        setShowBanner(true);
      }
    }
  }, [consentGiven]);

  const handleAcceptAll = () => {
    grantAllConsent();
    setShowBanner(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('consent_banner_seen', 'true');
    }
  };

  const handleRejectAll = () => {
    denyAllConsent();
    setShowBanner(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('consent_banner_seen', 'true');
    }
  };

  const handleAnalyticsOnly = () => {
    setAnalyticsOnly();
    setShowBanner(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('consent_banner_seen', 'true');
    }
  };

  if (!showBanner) {
    return null;
  }

  const baseClasses = `
    fixed left-0 right-0 z-50 p-4 shadow-lg border-t
    ${position === 'top' ? 'top-0' : 'bottom-0'}
    ${theme === 'light' 
      ? 'bg-white text-gray-900 border-gray-200' 
      : 'bg-gray-900 text-white border-gray-700'
    }
    ${className}
  `;

  return (
    <div className={baseClasses}>
      <div className="max-w-7xl mx-auto">
        {!showDetails ? (
          // Simple consent banner
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-2">
                🍪 We use cookies to enhance your experience
              </h3>
              <p className="text-sm opacity-90">
                We use cookies and similar technologies to analyze traffic, personalize content, 
                and serve targeted advertisements. By clicking &quot;Accept All&quot;, you consent to our 
                use of cookies.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 min-w-max">
              <button
                onClick={handleRejectAll}
                className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                  theme === 'light'
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Reject All
              </button>
              
              <button
                onClick={() => setShowDetails(true)}
                className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                  theme === 'light'
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Customize
              </button>
              
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          // Detailed consent options
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Customize Cookie Preferences</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-2xl leading-none opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </div>
            
            <p className="text-sm opacity-90">
              Choose which types of cookies you want to allow. You can change these settings at any time.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Essential Cookies */}
              <div className={`p-4 rounded-lg border ${
                theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-gray-700 bg-gray-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Essential</h4>
                  <div className="text-green-500 text-sm font-medium">Always On</div>
                </div>
                <p className="text-sm opacity-75 mb-2">
                  Required for the website to function properly. Cannot be disabled.
                </p>
                <div className="text-xs opacity-60">
                  Shopping cart, user authentication, security
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className={`p-4 rounded-lg border ${
                theme === 'light' ? 'border-gray-200' : 'border-gray-700'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Analytics</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked={false}
                      id="analytics-toggle"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm opacity-75 mb-2">
                  Help us understand how visitors interact with our website.
                </p>
                <div className="text-xs opacity-60">
                  Google Analytics, page views, user behavior
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className={`p-4 rounded-lg border ${
                theme === 'light' ? 'border-gray-200' : 'border-gray-700'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Marketing</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked={false}
                      id="marketing-toggle"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm opacity-75 mb-2">
                  Used to deliver personalized advertisements and measure campaign effectiveness.
                </p>
                <div className="text-xs opacity-60">
                  Facebook Pixel, Google Ads, retargeting
                </div>
              </div>

              {/* Personalization Cookies */}
              <div className={`p-4 rounded-lg border ${
                theme === 'light' ? 'border-gray-200' : 'border-gray-700'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Personalization</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked={false}
                      id="personalization-toggle"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm opacity-75 mb-2">
                  Remember your preferences and provide customized experiences.
                </p>
                <div className="text-xs opacity-60">
                  Language preferences, recently viewed products
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <button
                onClick={handleRejectAll}
                className={`px-6 py-2 text-sm rounded-md border transition-colors ${
                  theme === 'light'
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                Reject All
              </button>
              
              <button
                onClick={handleAnalyticsOnly}
                className={`px-6 py-2 text-sm rounded-md border transition-colors ${
                  theme === 'light'
                    ? 'border-blue-300 text-blue-700 hover:bg-blue-50'
                    : 'border-blue-600 text-blue-300 hover:bg-blue-900'
                }`}
              >
                Analytics Only
              </button>
              
              <button
                onClick={() => {
                  // Get toggle states and set custom consent
                  const analyticsToggle = document.getElementById('analytics-toggle') as HTMLInputElement;
                  const marketingToggle = document.getElementById('marketing-toggle') as HTMLInputElement;
                  const personalizationToggle = document.getElementById('personalization-toggle') as HTMLInputElement;

                  const customConsent = {
                    analytics_storage: analyticsToggle?.checked ? 'granted' as const : 'denied' as const,
                    ad_storage: marketingToggle?.checked ? 'granted' as const : 'denied' as const,
                    ad_user_data: marketingToggle?.checked ? 'granted' as const : 'denied' as const,
                    ad_personalization: marketingToggle?.checked ? 'granted' as const : 'denied' as const,
                    functionality_storage: 'granted' as const,
                    personalization_storage: personalizationToggle?.checked ? 'granted' as const : 'denied' as const,
                    security_storage: 'granted' as const,
                  };

                  // Use the analytics context to set consent
                  setConsent(customConsent);
                  
                  setShowBanner(false);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('consent_banner_seen', 'true');
                  }
                }}
                className="px-6 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}