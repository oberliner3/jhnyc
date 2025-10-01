/**
 * React Hooks for Experience Tracking
 * Easy-to-use hooks for tracking user behavior in React components
 */

import { useCallback, useEffect, useRef } from 'react';
import { experienceTracker } from './index';
import type { 
  JourneyType, 
  ExperienceTrackingEvent
} from './types';

/**
 * Hook for tracking custom events
 */
export function useExperienceTracker() {
  const track = useCallback((event: Partial<ExperienceTrackingEvent>) => {
    experienceTracker.track(event);
  }, []);

  const setUserId = useCallback((userId: string) => {
    experienceTracker.setUserId(userId);
  }, []);

  const trackPageView = useCallback((url?: string, title?: string) => {
    experienceTracker.trackPageView(url, title);
  }, []);

  const trackJourneyStep = useCallback((
    journeyType: JourneyType,
    step: string,
    stepOrder: number,
    properties?: Record<string, unknown>
  ) => {
    experienceTracker.trackJourneyStep(journeyType, step, stepOrder, properties);
  }, []);

  const completeJourneyStep = useCallback((
    journeyType: JourneyType,
    step: string,
    conversionValue?: number
  ) => {
    experienceTracker.completeJourneyStep(journeyType, step, conversionValue);
  }, []);

  const flush = useCallback(() => {
    return experienceTracker.flush();
  }, []);

  return {
    track,
    setUserId,
    trackPageView,
    trackJourneyStep,
    completeJourneyStep,
    flush,
  };
}

/**
 * Hook for tracking page views automatically
 */
export function usePageViewTracking(url?: string, title?: string) {
  const { trackPageView } = useExperienceTracker();

  useEffect(() => {
    trackPageView(url, title);
  }, [url, title, trackPageView]);
}

/**
 * Hook for tracking element clicks
 */
export function useClickTracking(
  elementName: string,
  properties?: Record<string, unknown>
) {
  const { track } = useExperienceTracker();

  const trackClick = useCallback((event?: React.MouseEvent, additionalProperties?: Record<string, unknown>) => {
    track({
      eventType: 'click',
      eventName: `click_${elementName}`,
      elementSelector: elementName,
      clickCoordinates: event ? { 
        x: event.clientX, 
        y: event.clientY 
      } : undefined,
      properties: { ...properties, ...additionalProperties },
    });
  }, [track, elementName, properties]);

  return trackClick;
}

/**
 * Hook for tracking form interactions
 */
export function useFormTracking(formName: string) {
  const { track } = useExperienceTracker();

  const trackFormStart = useCallback(() => {
    track({
      eventType: 'form_interaction',
      eventName: `form_start_${formName}`,
      formName,
      action: 'focus',
    });
  }, [track, formName]);

  const trackFormSubmit = useCallback((success: boolean = true, errorMessage?: string) => {
    track({
      eventType: 'form_interaction',
      eventName: `form_submit_${formName}`,
      formName,
      action: 'submit',
      properties: {
        success,
        errorMessage,
      },
    });
  }, [track, formName]);

  const trackFieldInteraction = useCallback((fieldName: string, fieldType: string, action: 'focus' | 'change' | 'blur') => {
    track({
      eventType: 'form_interaction',
      eventName: `form_field_${action}_${formName}`,
      formName,
      fieldName,
      fieldType,
      action,
    });
  }, [track, formName]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFieldInteraction,
  };
}

/**
 * Hook for tracking scroll depth
 */
export function useScrollTracking(
  thresholds: number[] = [25, 50, 75, 90],
  debounceMs: number = 100
) {
  const { track } = useExperienceTracker();
  const sentThresholds = useRef<Set<number>>(new Set());

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollDepth = Math.round((scrollTop / scrollHeight) * 100);

        for (const threshold of thresholds) {
          if (scrollDepth >= threshold && !sentThresholds.current.has(threshold)) {
            sentThresholds.current.add(threshold);
            
            track({
              eventType: 'scroll',
              eventName: `scroll_depth_${threshold}`,
              scrollDepth: threshold,
              scrollTop,
              scrollLeft: window.pageXOffset || document.documentElement.scrollLeft,
            });
          }
        }
      }, debounceMs);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [thresholds, debounceMs, track]);

  // Reset thresholds when component remounts (new page)
  useEffect(() => {
    sentThresholds.current.clear();
  }, []);
}

/**
 * Hook for tracking time spent on page/component
 */
export function useTimeTracking(
  eventName: string,
  properties?: Record<string, unknown>
) {
  const { track } = useExperienceTracker();
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    startTime.current = Date.now();

    return () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      
      track({
        eventType: 'engagement',
        eventName: `time_${eventName}`,
        properties: {
          ...properties,
          timeSpent,
        },
      });
    };
  }, [track, eventName, properties]);

  const trackTimeCheckpoint = useCallback((checkpointName: string) => {
    const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
    
    track({
      eventType: 'engagement',
      eventName: `time_checkpoint_${eventName}_${checkpointName}`,
      properties: {
        ...properties,
        timeSpent,
        checkpoint: checkpointName,
      },
    });
  }, [track, eventName, properties]);

  return { trackTimeCheckpoint };
}

/**
 * Hook for tracking product/content views
 */
export function useProductTracking() {
  const { track } = useExperienceTracker();

  const trackProductView = useCallback((productId: string, productData?: Record<string, unknown>) => {
    track({
      eventType: 'product',
      eventName: 'product_view',
      productId,
      properties: productData,
    });
  }, [track]);

  const trackProductClick = useCallback((productId: string, productData?: Record<string, unknown>) => {
    track({
      eventType: 'product',
      eventName: 'product_click',
      productId,
      properties: productData,
    });
  }, [track]);

  const trackAddToCart = useCallback((
    productId: string, 
    quantity: number = 1, 
    price?: number,
    productData?: Record<string, unknown>
  ) => {
    track({
      eventType: 'ecommerce',
      eventName: 'add_to_cart',
      productId,
      properties: {
        ...productData,
        quantity,
        price,
        value: price ? price * quantity : undefined,
      },
    });
  }, [track]);

  const trackRemoveFromCart = useCallback((
    productId: string, 
    quantity: number = 1,
    productData?: Record<string, unknown>
  ) => {
    track({
      eventType: 'ecommerce',
      eventName: 'remove_from_cart',
      productId,
      properties: {
        ...productData,
        quantity,
      },
    });
  }, [track]);

  const trackPurchase = useCallback((
    orderId: string,
    totalValue: number,
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>,
    properties?: Record<string, unknown>
  ) => {
    track({
      eventType: 'ecommerce',
      eventName: 'purchase',
      orderId,
      properties: {
        ...properties,
        totalValue,
        items,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  }, [track]);

  return {
    trackProductView,
    trackProductClick,
    trackAddToCart,
    trackRemoveFromCart,
    trackPurchase,
  };
}

/**
 * Hook for tracking search behavior
 */
export function useSearchTracking() {
  const { track } = useExperienceTracker();

  const trackSearch = useCallback((
    query: string, 
    resultCount?: number, 
    filters?: Record<string, unknown>
  ) => {
    track({
      eventType: 'search',
      eventName: 'search_query',
      searchQuery: query,
      properties: {
        resultCount,
        filters,
      },
    });
  }, [track]);

  const trackSearchResultClick = useCallback((
    query: string,
    resultPosition: number,
    resultId: string,
    resultType?: string
  ) => {
    track({
      eventType: 'search',
      eventName: 'search_result_click',
      searchQuery: query,
      properties: {
        resultPosition,
        resultId,
        resultType,
      },
    });
  }, [track]);

  const trackFilterChange = useCallback((
    filterName: string,
    filterValue: string,
    resultCount?: number
  ) => {
    track({
      eventType: 'search',
      eventName: 'search_filter_change',
      properties: {
        filterName,
        filterValue,
        resultCount,
      },
    });
  }, [track]);

  return {
    trackSearch,
    trackSearchResultClick,
    trackFilterChange,
  };
}

/**
 * Hook for tracking errors and exceptions
 */
export function useErrorTracking() {
  const { track } = useExperienceTracker();

  const trackError = useCallback((
    errorType: 'javascript' | 'network' | 'validation' | '404' | '500' | 'other',
    errorMessage: string,
    errorStack?: string,
    properties?: Record<string, unknown>
  ) => {
    track({
      eventType: 'error',
      eventName: `error_${errorType}`,
      errorType,
      errorMessage,
      errorStack,
      properties,
    });
  }, [track]);

  const trackApiError = useCallback((
    endpoint: string,
    status: number,
    errorMessage: string,
    properties?: Record<string, unknown>
  ) => {
    track({
      eventType: 'error',
      eventName: 'api_error',
      errorType: 'api',
      errorMessage: `${endpoint}: ${errorMessage}`,
      properties: {
        ...properties,
        endpoint,
        status,
      },
    });
  }, [track]);

  const trackValidationError = useCallback((
    formName: string,
    fieldName: string,
    errorMessage: string
  ) => {
    track({
      eventType: 'error',
      eventName: 'validation_error',
      errorType: 'validation',
      errorMessage,
      formName,
      fieldName,
    });
  }, [track]);

  return {
    trackError,
    trackApiError,
    trackValidationError,
  };
}

/**
 * Hook for tracking user journey steps
 */
export function useJourneyTracking(journeyType: JourneyType) {
  const { trackJourneyStep, completeJourneyStep } = useExperienceTracker();

  const startStep = useCallback((
    step: string,
    stepOrder: number,
    properties?: Record<string, unknown>
  ) => {
    trackJourneyStep(journeyType, step, stepOrder, properties);
  }, [journeyType, trackJourneyStep]);

  const completeStep = useCallback((
    step: string,
    conversionValue?: number
  ) => {
    completeJourneyStep(journeyType, step, conversionValue);
  }, [journeyType, completeJourneyStep]);

  return {
    startStep,
    completeStep,
  };
}

/**
 * Hook for tracking engagement metrics
 */
export function useEngagementTracking(contentId: string, contentType: string = 'page') {
  const { track } = useExperienceTracker();
  const startTime = useRef<number>(Date.now());
  const hasTrackedView = useRef<boolean>(false);

  // Track content view on mount
  useEffect(() => {
    if (!hasTrackedView.current) {
      track({
        eventType: 'engagement',
        eventName: 'content_view',
        contentId,
        contentType,
      });
      hasTrackedView.current = true;
    }
  }, [track, contentId, contentType]);

  // Track engagement time on unmount
  useEffect(() => {
    const currentStartTime = startTime.current;
    return () => {
      const engagementTime = Math.round((Date.now() - currentStartTime) / 1000);
      
      if (engagementTime > 5) { // Only track if user spent more than 5 seconds
        track({
          eventType: 'engagement',
          eventName: 'content_engagement',
          contentId,
          contentType,
          properties: {
            engagementTime,
          },
        });
      }
    };
  }, [track, contentId, contentType]);

  const trackInteraction = useCallback((interactionType: string, properties?: Record<string, unknown>) => {
    track({
      eventType: 'engagement',
      eventName: `content_interaction_${interactionType}`,
      contentId,
      contentType,
      properties,
    });
  }, [track, contentId, contentType]);

  return { trackInteraction };
}