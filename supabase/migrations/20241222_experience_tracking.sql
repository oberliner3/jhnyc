-- Experience Tracking System for User Behavior Analysis
-- This migration creates tables and functions to track detailed user interactions

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create experience_tracks table for detailed user behavior tracking
CREATE TABLE IF NOT EXISTS public.experience_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Session and User Information
    session_id TEXT NOT NULL,
    user_id UUID,
    anonymous_id TEXT,
    
    -- Event Details
    event_type TEXT NOT NULL CHECK (event_type IN (
        'page_view', 'click', 'scroll', 'form_interaction', 'product_view', 
        'add_to_cart', 'search', 'filter', 'sort', 'hover', 'video_interaction',
        'image_interaction', 'checkout_step', 'error', 'performance'
    )),
    event_name TEXT NOT NULL,
    
    -- Page and Element Context
    page_url TEXT NOT NULL,
    page_title TEXT,
    element_selector TEXT,
    element_text TEXT,
    element_position JSONB,
    
    -- User Interaction Data
    interaction_data JSONB DEFAULT '{}',
    custom_properties JSONB DEFAULT '{}',
    
    -- Device and Environment
    user_agent TEXT,
    viewport_width INTEGER,
    viewport_height INTEGER,
    screen_width INTEGER,
    screen_height INTEGER,
    device_type TEXT,
    browser_name TEXT,
    browser_version TEXT,
    os_name TEXT,
    os_version TEXT,
    
    -- Performance Metrics
    page_load_time INTEGER,
    time_on_page INTEGER,
    scroll_depth INTEGER,
    
    -- Marketing Attribution
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    referrer_url TEXT,
    
    -- Technical Details
    ip_address INET,
    country_code TEXT,
    city TEXT,
    timezone TEXT,
    
    -- Timestamps
    client_timestamp TIMESTAMPTZ,
    server_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_sessions table to track session-level data
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT UNIQUE NOT NULL,
    user_id UUID,
    anonymous_id TEXT,
    
    -- Session Details
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration INTEGER, -- in seconds
    page_views INTEGER DEFAULT 0,
    interactions INTEGER DEFAULT 0,
    
    -- Entry and Exit
    entry_url TEXT,
    entry_page_title TEXT,
    exit_url TEXT,
    exit_page_title TEXT,
    
    -- Device Information
    user_agent TEXT,
    device_type TEXT,
    browser_name TEXT,
    os_name TEXT,
    
    -- Attribution
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    referrer_url TEXT,
    
    -- Geography
    ip_address INET,
    country_code TEXT,
    city TEXT,
    
    -- Session Quality
    bounce BOOLEAN DEFAULT FALSE,
    converted BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL(10,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_journeys table for funnel analysis
CREATE TABLE IF NOT EXISTS public.user_journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    anonymous_id TEXT,
    session_id TEXT,
    
    -- Journey Information
    journey_type TEXT NOT NULL CHECK (journey_type IN (
        'product_discovery', 'purchase_funnel', 'onboarding', 'support', 'content_engagement'
    )),
    journey_step TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    
    -- Step Details
    page_url TEXT,
    action_taken TEXT,
    time_spent INTEGER, -- seconds on this step
    
    -- Success Metrics
    completed BOOLEAN DEFAULT FALSE,
    dropped_off BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL(10,2),
    
    -- Context
    properties JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    page_url TEXT NOT NULL,
    
    -- Core Web Vitals
    lcp DECIMAL(8,2), -- Largest Contentful Paint
    fid DECIMAL(8,2), -- First Input Delay
    cls DECIMAL(6,4), -- Cumulative Layout Shift
    fcp DECIMAL(8,2), -- First Contentful Paint
    ttfb DECIMAL(8,2), -- Time to First Byte
    
    -- Navigation Timing
    dns_lookup_time INTEGER,
    tcp_connect_time INTEGER,
    tls_setup_time INTEGER,
    request_time INTEGER,
    response_time INTEGER,
    dom_processing_time INTEGER,
    load_event_time INTEGER,
    
    -- Custom Metrics
    custom_metrics JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_experience_tracks_session_id ON public.experience_tracks(session_id);
CREATE INDEX IF NOT EXISTS idx_experience_tracks_user_id ON public.experience_tracks(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_experience_tracks_anonymous_id ON public.experience_tracks(anonymous_id) WHERE anonymous_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_experience_tracks_event_type ON public.experience_tracks(event_type);
CREATE INDEX IF NOT EXISTS idx_experience_tracks_page_url ON public.experience_tracks(page_url);
CREATE INDEX IF NOT EXISTS idx_experience_tracks_created_at ON public.experience_tracks(created_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON public.user_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_user_journeys_user_id ON public.user_journeys(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_journeys_anonymous_id ON public.user_journeys(anonymous_id) WHERE anonymous_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_journeys_journey_type ON public.user_journeys(journey_type);
CREATE INDEX IF NOT EXISTS idx_user_journeys_session_id ON public.user_journeys(session_id);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_session_id ON public.performance_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_page_url ON public.performance_metrics(page_url);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON public.performance_metrics(created_at);

-- Function to update session statistics
CREATE OR REPLACE FUNCTION update_session_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update session statistics when new experience tracks are added
    INSERT INTO public.user_sessions (
        session_id, user_id, anonymous_id, started_at, entry_url, entry_page_title,
        user_agent, device_type, browser_name, os_name,
        utm_source, utm_medium, utm_campaign, referrer_url,
        ip_address, country_code, city, page_views, interactions
    )
    VALUES (
        NEW.session_id, NEW.user_id, NEW.anonymous_id, NEW.created_at, NEW.page_url, NEW.page_title,
        NEW.user_agent, NEW.device_type, NEW.browser_name, NEW.os_name,
        NEW.utm_source, NEW.utm_medium, NEW.utm_campaign, NEW.referrer_url,
        NEW.ip_address, NEW.country_code, NEW.city, 
        CASE WHEN NEW.event_type = 'page_view' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_type != 'page_view' THEN 1 ELSE 0 END
    )
    ON CONFLICT (session_id) DO UPDATE SET
        user_id = COALESCE(NEW.user_id, user_sessions.user_id),
        ended_at = NEW.created_at,
        exit_url = NEW.page_url,
        exit_page_title = NEW.page_title,
        page_views = user_sessions.page_views + CASE WHEN NEW.event_type = 'page_view' THEN 1 ELSE 0 END,
        interactions = user_sessions.interactions + CASE WHEN NEW.event_type != 'page_view' THEN 1 ELSE 0 END,
        duration = EXTRACT(EPOCH FROM (NEW.created_at - user_sessions.started_at))::INTEGER,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update session stats
DROP TRIGGER IF EXISTS trigger_update_session_stats ON public.experience_tracks;
CREATE TRIGGER trigger_update_session_stats
    AFTER INSERT ON public.experience_tracks
    FOR EACH ROW EXECUTE FUNCTION update_session_stats();

-- Function to detect bounce sessions
CREATE OR REPLACE FUNCTION mark_bounce_sessions()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Mark sessions as bounces if they have only one page view and lasted less than 30 seconds
    UPDATE public.user_sessions 
    SET bounce = TRUE, updated_at = NOW()
    WHERE page_views <= 1 
      AND duration < 30 
      AND bounce = FALSE
      AND ended_at < (NOW() - INTERVAL '5 minutes'); -- Only process sessions that ended 5+ minutes ago
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate conversion funnel
CREATE OR REPLACE FUNCTION calculate_funnel_conversion(
    p_journey_type TEXT,
    p_start_date TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '30 days'),
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    step TEXT,
    step_order INTEGER,
    users BIGINT,
    conversion_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH funnel_steps AS (
        SELECT 
            journey_step,
            step_order,
            COUNT(DISTINCT COALESCE(user_id::TEXT, anonymous_id)) as step_users
        FROM public.user_journeys
        WHERE journey_type = p_journey_type
          AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY journey_step, step_order
        ORDER BY step_order
    ),
    first_step AS (
        SELECT step_users as first_step_users
        FROM funnel_steps
        ORDER BY step_order
        LIMIT 1
    )
    SELECT 
        fs.journey_step,
        fs.step_order,
        fs.step_users,
        CASE 
            WHEN fst.first_step_users > 0 THEN 
                ROUND((fs.step_users::DECIMAL / fst.first_step_users) * 100, 2)
            ELSE 0
        END as conversion_rate
    FROM funnel_steps fs
    CROSS JOIN first_step fst
    ORDER BY fs.step_order;
END;
$$ LANGUAGE plpgsql;

-- Function to get user behavior insights
CREATE OR REPLACE FUNCTION get_user_behavior_insights(
    p_start_date TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '7 days'),
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    metric_name TEXT,
    metric_value DECIMAL,
    metric_unit TEXT,
    comparison_period_value DECIMAL,
    change_percentage DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH current_period AS (
        -- Current period metrics
        SELECT 
            COUNT(DISTINCT session_id) as total_sessions,
            COUNT(DISTINCT CASE WHEN user_id IS NOT NULL THEN user_id END) as authenticated_users,
            COUNT(DISTINCT anonymous_id) as anonymous_users,
            AVG(CASE WHEN event_type = 'page_view' THEN time_on_page END) as avg_time_on_page,
            AVG(scroll_depth) as avg_scroll_depth,
            COUNT(*) FILTER (WHERE event_type = 'click') as total_clicks,
            COUNT(*) FILTER (WHERE event_type = 'page_view') as total_page_views
        FROM public.experience_tracks
        WHERE created_at BETWEEN p_start_date AND p_end_date
    ),
    previous_period AS (
        -- Previous period for comparison (same duration)
        SELECT 
            COUNT(DISTINCT session_id) as total_sessions,
            COUNT(DISTINCT CASE WHEN user_id IS NOT NULL THEN user_id END) as authenticated_users,
            COUNT(DISTINCT anonymous_id) as anonymous_users,
            AVG(CASE WHEN event_type = 'page_view' THEN time_on_page END) as avg_time_on_page,
            AVG(scroll_depth) as avg_scroll_depth,
            COUNT(*) FILTER (WHERE event_type = 'click') as total_clicks,
            COUNT(*) FILTER (WHERE event_type = 'page_view') as total_page_views
        FROM public.experience_tracks
        WHERE created_at BETWEEN 
            p_start_date - (p_end_date - p_start_date) AND 
            p_start_date
    )
    SELECT 
        'Total Sessions'::TEXT,
        cp.total_sessions::DECIMAL,
        'count'::TEXT,
        pp.total_sessions::DECIMAL,
        CASE WHEN pp.total_sessions > 0 THEN 
            ROUND(((cp.total_sessions - pp.total_sessions)::DECIMAL / pp.total_sessions) * 100, 2)
            ELSE 0 END
    FROM current_period cp, previous_period pp
    
    UNION ALL
    
    SELECT 
        'Authenticated Users'::TEXT,
        cp.authenticated_users::DECIMAL,
        'count'::TEXT,
        pp.authenticated_users::DECIMAL,
        CASE WHEN pp.authenticated_users > 0 THEN 
            ROUND(((cp.authenticated_users - pp.authenticated_users)::DECIMAL / pp.authenticated_users) * 100, 2)
            ELSE 0 END
    FROM current_period cp, previous_period pp
    
    UNION ALL
    
    SELECT 
        'Average Time on Page'::TEXT,
        ROUND(cp.avg_time_on_page, 2),
        'seconds'::TEXT,
        ROUND(pp.avg_time_on_page, 2),
        CASE WHEN pp.avg_time_on_page > 0 THEN 
            ROUND(((cp.avg_time_on_page - pp.avg_time_on_page) / pp.avg_time_on_page) * 100, 2)
            ELSE 0 END
    FROM current_period cp, previous_period pp
    
    UNION ALL
    
    SELECT 
        'Average Scroll Depth'::TEXT,
        ROUND(cp.avg_scroll_depth, 2),
        'percentage'::TEXT,
        ROUND(pp.avg_scroll_depth, 2),
        CASE WHEN pp.avg_scroll_depth > 0 THEN 
            ROUND(((cp.avg_scroll_depth - pp.avg_scroll_depth) / pp.avg_scroll_depth) * 100, 2)
            ELSE 0 END
    FROM current_period cp, previous_period pp;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old tracking data
CREATE OR REPLACE FUNCTION cleanup_old_experience_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete experience tracks older than 90 days
    DELETE FROM public.experience_tracks 
    WHERE created_at < (NOW() - INTERVAL '90 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete user sessions older than 90 days
    DELETE FROM public.user_sessions 
    WHERE created_at < (NOW() - INTERVAL '90 days');
    
    -- Delete performance metrics older than 30 days
    DELETE FROM public.performance_metrics 
    WHERE created_at < (NOW() - INTERVAL '30 days');
    
    -- Delete user journeys older than 90 days
    DELETE FROM public.user_journeys 
    WHERE created_at < (NOW() - INTERVAL '90 days');
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS (Row Level Security)
ALTER TABLE public.experience_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for service role and authenticated users)
CREATE POLICY "Allow service role full access to experience_tracks" ON public.experience_tracks
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow authenticated access to experience_tracks" ON public.experience_tracks
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow anonymous access to experience_tracks" ON public.experience_tracks
    FOR INSERT USING (auth.role() = 'anon');

CREATE POLICY "Allow service role full access to user_sessions" ON public.user_sessions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow authenticated access to user_sessions" ON public.user_sessions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role full access to user_journeys" ON public.user_journeys
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow authenticated access to user_journeys" ON public.user_journeys
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role full access to performance_metrics" ON public.performance_metrics
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow authenticated access to performance_metrics" ON public.performance_metrics
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experience_tracks TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_sessions TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_journeys TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.performance_metrics TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Comments for documentation
COMMENT ON TABLE public.experience_tracks IS 'Detailed tracking of user interactions and behavior';
COMMENT ON TABLE public.user_sessions IS 'Session-level aggregated data for user visits';
COMMENT ON TABLE public.user_journeys IS 'User journey and funnel tracking for conversion analysis';
COMMENT ON TABLE public.performance_metrics IS 'Core Web Vitals and performance metrics tracking';

COMMENT ON FUNCTION update_session_stats() IS 'Automatically updates session statistics when experience tracks are added';
COMMENT ON FUNCTION mark_bounce_sessions() IS 'Identifies and marks bounce sessions based on behavior';
COMMENT ON FUNCTION calculate_funnel_conversion(TEXT, TIMESTAMPTZ, TIMESTAMPTZ) IS 'Calculates conversion rates for user journey funnels';
COMMENT ON FUNCTION get_user_behavior_insights(TIMESTAMPTZ, TIMESTAMPTZ) IS 'Provides behavioral insights with period-over-period comparison';
COMMENT ON FUNCTION cleanup_old_experience_data() IS 'Cleans up old tracking data to manage database size';