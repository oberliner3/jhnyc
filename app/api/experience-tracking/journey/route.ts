/**
 * User Journey Tracking API Route
 * Handles user journey step tracking and completion
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { UserJourney } from '@/lib/experience-tracking/types';
import { publicEnv, serverEnv } from '@/lib/env-validation';

export async function POST(request: NextRequest) {
  const { NEXT_PUBLIC_EXPERIENCE_TRACKING_ENABLED, NEXT_PUBLIC_SUPABASE_URL } = publicEnv;
  const { SUPABASE_SERVICE_ROLE_KEY } = serverEnv;

  if (!NEXT_PUBLIC_EXPERIENCE_TRACKING_ENABLED) {
    return NextResponse.json(
      { success: false, error: 'Experience tracking is disabled' },
      { status: 403 }
    );
  }

  try {
    const supabase = createClient(
      NEXT_PUBLIC_SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    const journeyData: UserJourney = await request.json();

    // Validate required fields
    if (!journeyData.sessionId || !journeyData.journeyType || !journeyData.journeyStep) {
      return NextResponse.json(
        { success: false, error: 'Missing required journey data' },
        { status: 400 }
      );
    }

    // Insert journey step
    const { error } = await supabase
      .from('user_journeys')
      .insert({
        user_id: journeyData.userId || null,
        anonymous_id: journeyData.anonymousId,
        session_id: journeyData.sessionId,
        journey_type: journeyData.journeyType,
        journey_step: journeyData.journeyStep,
        step_order: journeyData.stepOrder,
        page_url: journeyData.pageUrl,
        completed: journeyData.completed || false,
        dropped_off: journeyData.droppedOff || false,
        conversion_value: journeyData.conversionValue || null,
        properties: journeyData.properties || null,
        created_at: journeyData.createdAt || new Date(),
        updated_at: new Date(),
      });

    if (error) {
      console.error('Failed to insert journey step:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to store journey step' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Journey tracking API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}