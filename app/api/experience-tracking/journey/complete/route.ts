/**
 * Journey Step Completion API Route
 * Marks journey steps as completed with optional conversion values
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { JourneyType } from '@/lib/experience-tracking/types';
import { env } from '@/lib/env-validation';

interface JourneyCompletionRequest {
  sessionId: string;
  journeyType: JourneyType;
  step: string;
  conversionValue?: number;
}

export async function POST(request: NextRequest) {
  const { NEXT_PUBLIC_EXPERIENCE_TRACKING_ENABLED, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env;
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

    const { sessionId, journeyType, step, conversionValue }: JourneyCompletionRequest = await request.json();

    if (!sessionId || !journeyType || !step) {
      return NextResponse.json(
        { success: false, error: 'Missing required completion data' },
        { status: 400 }
      );
    }

    // Update the journey step to mark as completed
    const { error } = await supabase
      .from('user_journeys')
      .update({
        completed: true,
        conversion_value: conversionValue || null,
        completed_at: new Date(),
        updated_at: new Date(),
      })
      .match({
        session_id: sessionId,
        journey_type: journeyType,
        journey_step: step,
      });

    if (error) {
      console.error('Failed to update journey completion:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update journey step' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Journey completion API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}