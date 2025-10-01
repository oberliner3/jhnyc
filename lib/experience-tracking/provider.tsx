/**
 * Experience Tracking Provider
 * React context provider for experience tracking functionality
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ExperienceTracker } from './index';
import type { TrackingConfig, ExperienceTrackingEvent } from './types';

interface ExperienceTrackingContextType {
  tracker: ExperienceTracker | null;
  isInitialized: boolean;
  setUserId: (userId: string) => void;
  track: (event: Partial<ExperienceTrackingEvent>) => void;
  flush: () => Promise<void>;
}

const ExperienceTrackingContext = createContext<ExperienceTrackingContextType | null>(null);

interface ExperienceTrackingProviderProps {
  children: React.ReactNode;
  config?: Partial<TrackingConfig>;
  userId?: string;
  disabled?: boolean;
}

export function ExperienceTrackingProvider({ 
  children, 
  config = {},
  userId,
  disabled = false
}: ExperienceTrackingProviderProps) {
  const [tracker, setTracker] = useState<ExperienceTracker | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (disabled || typeof window === 'undefined') {
      return;
    }

    // Initialize tracker
    const trackerInstance = new ExperienceTracker(config);
    setTracker(trackerInstance);
    setIsInitialized(true);

    // Set user ID if provided
    if (userId) {
      trackerInstance.setUserId(userId);
    }

    // Cleanup on unmount
    return () => {
      trackerInstance.destroy();
    };
  }, [config, disabled]);

  // Update user ID when it changes
  useEffect(() => {
    if (tracker && userId) {
      tracker.setUserId(userId);
    }
  }, [tracker, userId]);

  const setUserId = (newUserId: string) => {
    if (tracker) {
      tracker.setUserId(newUserId);
    }
  };

  const track = (event: Partial<ExperienceTrackingEvent>) => {
    if (tracker) {
      tracker.track(event);
    }
  };

  const flush = async () => {
    if (tracker) {
      return tracker.flush();
    }
  };

  const contextValue: ExperienceTrackingContextType = {
    tracker,
    isInitialized,
    setUserId,
    track,
    flush,
  };

  return (
    <ExperienceTrackingContext.Provider value={contextValue}>
      {children}
    </ExperienceTrackingContext.Provider>
  );
}

export function useExperienceTrackingContext() {
  const context = useContext(ExperienceTrackingContext);
  
  if (!context) {
    throw new Error(
      'useExperienceTrackingContext must be used within an ExperienceTrackingProvider'
    );
  }
  
  return context;
}

// Enhanced hooks that use the context
export function useExperienceTracking() {
  const { track, setUserId, flush, isInitialized } = useExperienceTrackingContext();
  
  return {
    track,
    setUserId,
    flush,
    isInitialized,
  };
}