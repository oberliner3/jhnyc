/**
 * Experience Tracking API Route
 * Receives and processes user behavior tracking data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { 
  TrackingBatch, 
  TrackingResponse,
  ExperienceTrackingEvent,
  UserSession 
} from '@/lib/experience-tracking/types';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
);

export async function POST(request: NextRequest) {
  try {
    const batch: TrackingBatch = await request.json();
    
    if (!batch.events || !Array.isArray(batch.events) || batch.events.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or empty events array' },
        { status: 400 }
      );
    }

    // Get client information from headers
    const clientInfo = getClientInfo(request);
    
    // Process events in batch
    const processedEvents = batch.events.map(event => 
      enrichEventWithServerData(event, clientInfo)
    );

    // Insert events into Supabase
    const { error: eventsError } = await supabase
      .from('experience_tracks')
      .insert(processedEvents.map(formatEventForDatabase));

    if (eventsError) {
      console.error('Failed to insert events:', eventsError);
      return NextResponse.json(
        { success: false, error: 'Failed to store events' },
        { status: 500 }
      );
    }

    // Update or create user session
    if (batch.sessionInfo) {
      await updateUserSession(batch.sessionInfo, clientInfo);
    }

    const response: TrackingResponse = {
      success: true,
      processedEvents: processedEvents.length,
      batchId: batch.batchId,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Experience tracking API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Extract client information from request headers
 */
function getClientInfo(request: NextRequest) {
  
  return {
    userAgent: request.headers.get('user-agent') || 'Unknown',
    ipAddress: getClientIP(request),
    countryCode: 'Unknown',
    city: 'Unknown',
    timestamp: new Date(),
  };
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-client-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'Unknown'
  );
}

/**
 * Enrich event with server-side data
 */
function enrichEventWithServerData(
  event: ExperienceTrackingEvent,
  clientInfo: ReturnType<typeof getClientInfo>
): ExperienceTrackingEvent {
  return {
    ...event,
    serverTimestamp: clientInfo.timestamp,
    ipAddress: clientInfo.ipAddress,
    geoData: {
      ipAddress: clientInfo.ipAddress,
      countryCode: clientInfo.countryCode,
      city: clientInfo.city,
    },
    attribution: {},
    // Override user agent from server if not provided
    deviceInfo: event.deviceInfo ? {
      ...event.deviceInfo,
      userAgent: event.deviceInfo?.userAgent || clientInfo.userAgent,
    } : undefined,
  };
}

/**
 * Format event for database insertion
 */
function formatEventForDatabase(event: ExperienceTrackingEvent) {
  return {
    session_id: event.sessionId,
    user_id: event.userId || null,
    anonymous_id: event.anonymousId,
    event_type: event.eventType,
    event_name: event.eventName,
    page_url: event.pageUrl,
    page_title: event.pageTitle,
    previous_url: event.previousUrl || null,
    referrer: event.referrer || null,
    
    // Element tracking
    element_selector: event.elementSelector || null,
    element_text: event.elementText || null,
    element_position: event.elementPosition || null,
    
    // Interaction data
    click_coordinates: event.clickCoordinates || null,
    button_type: event.buttonType || null,
    scroll_depth: event.scrollDepth || null,
    scroll_top: event.scrollTop || null,
    scroll_left: event.scrollLeft || null,
    max_scroll_depth: event.maxScrollDepth || null,
    
    // Form data
    form_name: event.formName || null,
    form_selector: event.formSelector || null,
    field_name: event.fieldName || null,
    field_type: event.fieldType || null,
    action: event.action || null,
    
    // Error data
    error_type: event.errorType || null,
    error_message: event.errorMessage || null,
    error_url: event.errorUrl || null,
    error_line: event.errorLine || null,
    error_column: event.errorColumn || null,
    error_stack: event.errorStack || null,
    
    // Product/content data
    product_id: event.productId || null,
    content_id: event.contentId || null,
    content_type: event.contentType || null,
    search_query: event.searchQuery || null,
    order_id: event.orderId || null,
    
    // Performance metrics
    performance_metrics: event.performanceMetrics || null,
    
    // Device and attribution
    device_info: event.deviceInfo || null,
    attribution_data: event.attribution || null,
    geo_data: event.geoData || null,
    
    // Additional properties
    properties: event.properties || null,
    
    // Timestamps
    client_timestamp: event.clientTimestamp || new Date(),
    server_timestamp: event.serverTimestamp || new Date(),
    timestamp: event.timestamp || Date.now(),
    
    // Server data
    ip_address: event.ipAddress || null,
    created_at: new Date(),
  };
}

/**
 * Update or create user session
 */
async function updateUserSession(
  sessionInfo: TrackingBatch['sessionInfo'],
  clientInfo: ReturnType<typeof getClientInfo>
) {
  try {
    // Check if session exists
    const { data: existingSession } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_id', sessionInfo.sessionId)
      .single();

    const now = new Date();

    if (existingSession) {
      // Update existing session
      await supabase
        .from('user_sessions')
        .update({
          user_id: sessionInfo.userId || existingSession.user_id,
          last_activity_at: now,
          updated_at: now,
        })
        .eq('session_id', sessionInfo.sessionId);
    } else {
      // Create new session
      const sessionData: Partial<UserSession> = {
        sessionId: sessionInfo.sessionId,
        userId: sessionInfo.userId || undefined,
        anonymousId: sessionInfo.anonymousId,
        startedAt: now,
        lastActivityAt: now,
        deviceInfo: {
          userAgent: clientInfo.userAgent,
          deviceType: 'unknown', // Will be updated by client-side data
          browserName: 'unknown',
          osName: 'unknown',
          viewportWidth: 0,
          viewportHeight: 0,
          screenWidth: 0,
          screenHeight: 0,
          browserVersion: 'unknown',
          osVersion: 'unknown',
        },
        geoData: {
          countryCode: clientInfo.countryCode,
          city: clientInfo.city,
        },
        ipAddress: clientInfo.ipAddress,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      await supabase
        .from('user_sessions')
        .insert({
          session_id: sessionData.sessionId,
          user_id: sessionData.userId,
          anonymous_id: sessionData.anonymousId,
          started_at: sessionData.startedAt,
          last_activity_at: sessionData.lastActivityAt,
          device_info: sessionData.deviceInfo,
          geo_data: sessionData.geoData,
          ip_address: sessionData.ipAddress,
          is_active: sessionData.isActive,
          created_at: sessionData.createdAt,
          updated_at: sessionData.updatedAt,
        });
    }
  } catch (error) {
    console.error('Failed to update user session:', error);
    // Don't fail the entire request if session update fails
  }
}