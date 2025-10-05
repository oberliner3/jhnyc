"use client";

import { InstallPrompt } from "./install-prompt";

/**
 * PWA Provider Component
 * Provides PWA install prompt functionality
 *
 * TODO: Implement service worker registration when needed
 * TODO: Add offline support
 * TODO: Add push notifications
 */
export function PWAProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InstallPrompt />
    </>
  );
}
