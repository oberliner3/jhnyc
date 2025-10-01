/**
 * Cart Analytics API
 * Provides analytics data for anonymous cart performance
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/analytics/carts
 * Get cart analytics for the specified date range
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const supabase = await createClient();

    // Call the Supabase function to get cart analytics
    let data, error;
    if (startDate && endDate) {
      const result = await supabase.rpc('get_cart_analytics', {
        p_start_date: startDate,
        p_end_date: endDate,
      });
      data = result.data;
      error = result.error;
    } else {
      // Use default dates (last 30 days)
      const result = await supabase.rpc('get_cart_analytics');
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Error fetching cart analytics:", error);
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 }
      );
    }

    // The RPC function returns an array with a single row
    const analytics = data?.[0] || {
      total_carts: 0,
      active_carts: 0,
      abandoned_carts: 0,
      converted_carts: 0,
      avg_cart_value: 0,
      avg_items_per_cart: 0,
      conversion_rate: 0,
      abandonment_rate: 0,
    };

    return NextResponse.json({
      totalCarts: Number(analytics.total_carts),
      activeCarts: Number(analytics.active_carts),
      abandonedCarts: Number(analytics.abandoned_carts),
      convertedCarts: Number(analytics.converted_carts),
      avgCartValue: Number(analytics.avg_cart_value),
      avgItemsPerCart: Number(analytics.avg_items_per_cart),
      conversionRate: Number(analytics.conversion_rate),
      abandonmentRate: Number(analytics.abandonment_rate),
    });
  } catch (error) {
    console.error("Error in cart analytics API:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/carts
 * Trigger maintenance functions (cleanup expired carts, mark abandoned carts)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action } = body;

    const supabase = await createClient();

    let result;
    switch (action) {
      case "cleanup_expired":
        const { data: cleanupData, error: cleanupError } = await supabase.rpc('cleanup_expired_anonymous_carts');
        if (cleanupError) throw cleanupError;
        result = { deleted_carts: cleanupData };
        break;

      case "mark_abandoned":
        const { data: abandonedData, error: abandonedError } = await supabase.rpc('mark_abandoned_carts');
        if (abandonedError) throw abandonedError;
        result = { marked_abandoned: abandonedData };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'cleanup_expired' or 'mark_abandoned'" },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in cart maintenance:", error);
    return NextResponse.json(
      { error: "Failed to execute maintenance action" },
      { status: 500 }
    );
  }
}