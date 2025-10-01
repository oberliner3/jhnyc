-- ===================================================
-- Anonymous Cart and Experience Tracking Schema
-- ===================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create anonymous_carts table for guest users
CREATE TABLE IF NOT EXISTS public.anonymous_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- User info for remarketing (optional)
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Cart metadata
    cart_data JSONB NOT NULL DEFAULT '{}',
    total_value DECIMAL(10,2) DEFAULT 0,
    item_count INTEGER DEFAULT 0,
    
    -- Tracking info
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'converted', 'expired'))
);

-- Create anonymous_cart_items table for individual items
CREATE TABLE IF NOT EXISTS public.anonymous_cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.anonymous_carts(id) ON DELETE CASCADE,
    
    -- Product information
    product_id VARCHAR(255) NOT NULL,
    variant_id VARCHAR(255),
    product_title VARCHAR(255),
    product_image TEXT,
    
    -- Pricing and quantity
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    
    -- Metadata
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate items
    UNIQUE(cart_id, product_id, variant_id)
);

-- Create experience_tracks table for user behavior tracking
CREATE TABLE IF NOT EXISTS public.experience_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Session and user identification
    session_id VARCHAR(255) NOT NULL,
    user_id UUID, -- References auth.users(id) if authenticated
    anonymous_id VARCHAR(255), -- For anonymous users
    
    -- Event details
    event_type VARCHAR(100) NOT NULL, -- 'page_view', 'product_view', 'add_to_cart', 'purchase', etc.
    event_name VARCHAR(255) NOT NULL,
    page_url TEXT NOT NULL,
    page_title VARCHAR(255),
    referrer TEXT,
    
    -- Event data (flexible JSON structure)
    event_data JSONB NOT NULL DEFAULT '{}',
    
    -- User context
    user_agent TEXT,
    ip_address INET,
    screen_resolution VARCHAR(50),
    viewport_size VARCHAR(50),
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    
    -- Marketing attribution
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_term VARCHAR(255),
    utm_content VARCHAR(255),
    
    -- Performance metrics
    page_load_time INTEGER, -- milliseconds
    time_on_page INTEGER, -- seconds
    scroll_depth DECIMAL(5,2), -- percentage
    
    -- Timestamps
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    server_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes for performance
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_session_id ON public.anonymous_carts(session_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_expires_at ON public.anonymous_carts(expires_at);
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_status ON public.anonymous_carts(status);
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_email ON public.anonymous_carts(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_created_at ON public.anonymous_carts(created_at);

CREATE INDEX IF NOT EXISTS idx_anonymous_cart_items_cart_id ON public.anonymous_cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_cart_items_product_id ON public.anonymous_cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_cart_items_added_at ON public.anonymous_cart_items(added_at);

CREATE INDEX IF NOT EXISTS idx_experience_tracks_session_id ON public.experience_tracks(session_id);
CREATE INDEX IF NOT EXISTS idx_experience_tracks_user_id ON public.experience_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_experience_tracks_anonymous_id ON public.experience_tracks(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_experience_tracks_event_type ON public.experience_tracks(event_type);
CREATE INDEX IF NOT EXISTS idx_experience_tracks_timestamp ON public.experience_tracks(timestamp);
CREATE INDEX IF NOT EXISTS idx_experience_tracks_page_url ON public.experience_tracks(page_url);
CREATE INDEX IF NOT EXISTS idx_experience_tracks_utm_campaign ON public.experience_tracks(utm_campaign) WHERE utm_campaign IS NOT NULL;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_anonymous_carts_updated_at
    BEFORE UPDATE ON public.anonymous_carts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_anonymous_cart_items_updated_at
    BEFORE UPDATE ON public.anonymous_cart_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to clean up expired carts
CREATE OR REPLACE FUNCTION public.cleanup_expired_carts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expired carts and their items (CASCADE will handle items)
    DELETE FROM public.anonymous_carts 
    WHERE expires_at < NOW() 
    OR (status = 'expired' AND created_at < NOW() - INTERVAL '30 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update cart totals when items change
CREATE OR REPLACE FUNCTION public.update_cart_totals()
RETURNS TRIGGER AS $$
DECLARE
    cart_total DECIMAL(10,2);
    cart_count INTEGER;
BEGIN
    -- Calculate new totals for the cart
    SELECT 
        COALESCE(SUM(price * quantity), 0),
        COALESCE(SUM(quantity), 0)
    INTO cart_total, cart_count
    FROM public.anonymous_cart_items
    WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id);
    
    -- Update the cart
    UPDATE public.anonymous_carts
    SET 
        total_value = cart_total,
        item_count = cart_count,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.cart_id, OLD.cart_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to keep cart totals in sync
CREATE TRIGGER trigger_update_cart_totals_insert
    AFTER INSERT ON public.anonymous_cart_items
    FOR EACH ROW EXECUTE FUNCTION public.update_cart_totals();

CREATE TRIGGER trigger_update_cart_totals_update
    AFTER UPDATE ON public.anonymous_cart_items
    FOR EACH ROW EXECUTE FUNCTION public.update_cart_totals();

CREATE TRIGGER trigger_update_cart_totals_delete
    AFTER DELETE ON public.anonymous_cart_items
    FOR EACH ROW EXECUTE FUNCTION public.update_cart_totals();

-- Function to track user experience events
CREATE OR REPLACE FUNCTION public.track_experience_event(
    p_session_id VARCHAR(255),
    p_user_id UUID DEFAULT NULL,
    p_anonymous_id VARCHAR(255) DEFAULT NULL,
    p_event_type VARCHAR(100),
    p_event_name VARCHAR(255),
    p_page_url TEXT,
    p_event_data JSONB DEFAULT '{}',
    p_user_context JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.experience_tracks (
        session_id,
        user_id,
        anonymous_id,
        event_type,
        event_name,
        page_url,
        page_title,
        referrer,
        event_data,
        user_agent,
        ip_address,
        screen_resolution,
        viewport_size,
        device_type,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        page_load_time,
        time_on_page,
        scroll_depth
    ) VALUES (
        p_session_id,
        p_user_id,
        p_anonymous_id,
        p_event_type,
        p_event_name,
        p_page_url,
        (p_user_context->>'page_title'),
        (p_user_context->>'referrer'),
        p_event_data,
        (p_user_context->>'user_agent'),
        (p_user_context->>'ip_address')::INET,
        (p_user_context->>'screen_resolution'),
        (p_user_context->>'viewport_size'),
        (p_user_context->>'device_type'),
        (p_user_context->>'utm_source'),
        (p_user_context->>'utm_medium'),
        (p_user_context->>'utm_campaign'),
        (p_user_context->>'utm_term'),
        (p_user_context->>'utm_content'),
        (p_user_context->>'page_load_time')::INTEGER,
        (p_user_context->>'time_on_page')::INTEGER,
        (p_user_context->>'scroll_depth')::DECIMAL
    )
    RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE public.anonymous_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_tracks ENABLE ROW LEVEL SECURITY;

-- Anonymous carts: Allow access based on session_id (passed via app logic)
CREATE POLICY "Allow cart access by session" ON public.anonymous_carts
    FOR ALL USING (true); -- We'll handle security in the application layer

CREATE POLICY "Allow cart items access" ON public.anonymous_cart_items
    FOR ALL USING (true); -- We'll handle security in the application layer

-- Experience tracking: Allow all inserts (for analytics)
CREATE POLICY "Allow experience tracking inserts" ON public.experience_tracks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow experience tracking reads for authenticated users" ON public.experience_tracks
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create a scheduled job to clean up expired carts (if using pg_cron)
-- This would be added via Supabase dashboard or pg_cron extension
-- SELECT cron.schedule('cleanup-expired-carts', '0 2 * * *', 'SELECT public.cleanup_expired_carts();');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;