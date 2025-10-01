-- Anonymous Cart System for Guest User Tracking and Remarketing
-- This migration creates tables and functions to track anonymous user carts

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create anonymous_carts table
CREATE TABLE IF NOT EXISTS public.anonymous_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    email TEXT,
    phone TEXT,
    cart_data JSONB DEFAULT '{}',
    total_value DECIMAL(10,2) DEFAULT 0,
    item_count INTEGER DEFAULT 0,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address TEXT,
    status TEXT CHECK (status IN ('active', 'abandoned', 'converted', 'expired')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create anonymous_cart_items table
CREATE TABLE IF NOT EXISTS public.anonymous_cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES public.anonymous_carts(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    variant_id TEXT,
    product_title TEXT NOT NULL,
    product_image TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_session_id ON public.anonymous_carts(session_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_status ON public.anonymous_carts(status);
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_expires_at ON public.anonymous_carts(expires_at);
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_email ON public.anonymous_carts(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_utm_source ON public.anonymous_carts(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_anonymous_cart_items_cart_id ON public.anonymous_cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_cart_items_product_id ON public.anonymous_cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_cart_items_variant_id ON public.anonymous_cart_items(variant_id) WHERE variant_id IS NOT NULL;

-- Function to update cart totals when items change
CREATE OR REPLACE FUNCTION update_cart_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the cart totals
    UPDATE public.anonymous_carts 
    SET 
        total_value = (
            SELECT COALESCE(SUM(price * quantity), 0) 
            FROM public.anonymous_cart_items 
            WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
        ),
        item_count = (
            SELECT COALESCE(SUM(quantity), 0) 
            FROM public.anonymous_cart_items 
            WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.cart_id, OLD.cart_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update cart totals
DROP TRIGGER IF EXISTS trigger_update_cart_totals_on_insert ON public.anonymous_cart_items;
CREATE TRIGGER trigger_update_cart_totals_on_insert
    AFTER INSERT ON public.anonymous_cart_items
    FOR EACH ROW EXECUTE FUNCTION update_cart_totals();

DROP TRIGGER IF EXISTS trigger_update_cart_totals_on_update ON public.anonymous_cart_items;
CREATE TRIGGER trigger_update_cart_totals_on_update
    AFTER UPDATE ON public.anonymous_cart_items
    FOR EACH ROW EXECUTE FUNCTION update_cart_totals();

DROP TRIGGER IF EXISTS trigger_update_cart_totals_on_delete ON public.anonymous_cart_items;
CREATE TRIGGER trigger_update_cart_totals_on_delete
    AFTER DELETE ON public.anonymous_cart_items
    FOR EACH ROW EXECUTE FUNCTION update_cart_totals();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_anonymous_carts_updated_at ON public.anonymous_carts;
CREATE TRIGGER trigger_update_anonymous_carts_updated_at
    BEFORE UPDATE ON public.anonymous_carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_anonymous_cart_items_updated_at ON public.anonymous_cart_items;
CREATE TRIGGER trigger_update_anonymous_cart_items_updated_at
    BEFORE UPDATE ON public.anonymous_cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired carts (to be called by cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_anonymous_carts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Mark expired carts as expired first
    UPDATE public.anonymous_carts 
    SET status = 'expired', updated_at = NOW()
    WHERE expires_at < NOW() 
      AND status IN ('active', 'abandoned');
    
    -- Delete cart items for carts older than 30 days
    DELETE FROM public.anonymous_cart_items 
    WHERE cart_id IN (
        SELECT id FROM public.anonymous_carts 
        WHERE expires_at < (NOW() - INTERVAL '30 days')
    );
    
    -- Delete carts older than 30 days
    DELETE FROM public.anonymous_carts 
    WHERE expires_at < (NOW() - INTERVAL '30 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to mark carts as abandoned after inactivity
CREATE OR REPLACE FUNCTION mark_abandoned_carts()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Mark carts as abandoned if they haven't been updated in 24 hours
    UPDATE public.anonymous_carts 
    SET status = 'abandoned', updated_at = NOW()
    WHERE status = 'active' 
      AND updated_at < (NOW() - INTERVAL '24 hours')
      AND item_count > 0;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get cart analytics with specific date range
CREATE OR REPLACE FUNCTION get_cart_analytics(
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
    total_carts BIGINT,
    active_carts BIGINT,
    abandoned_carts BIGINT,
    converted_carts BIGINT,
    avg_cart_value DECIMAL,
    avg_items_per_cart DECIMAL,
    conversion_rate DECIMAL,
    abandonment_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_carts,
        COUNT(*) FILTER (WHERE status = 'active') as active_carts,
        COUNT(*) FILTER (WHERE status = 'abandoned') as abandoned_carts,
        COUNT(*) FILTER (WHERE status = 'converted') as converted_carts,
        ROUND(AVG(total_value), 2) as avg_cart_value,
        ROUND(AVG(item_count), 2) as avg_items_per_cart,
        CASE 
            WHEN COUNT(*) > 0 THEN
                ROUND((COUNT(*) FILTER (WHERE status = 'converted')::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0
        END as conversion_rate,
        CASE 
            WHEN COUNT(*) > 0 THEN
                ROUND((COUNT(*) FILTER (WHERE status = 'abandoned')::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0
        END as abandonment_rate
    FROM public.anonymous_carts
    WHERE created_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Overloaded function with default parameters (last 30 days)
CREATE OR REPLACE FUNCTION get_cart_analytics()
RETURNS TABLE (
    total_carts BIGINT,
    active_carts BIGINT,
    abandoned_carts BIGINT,
    converted_carts BIGINT,
    avg_cart_value DECIMAL,
    avg_items_per_cart DECIMAL,
    conversion_rate DECIMAL,
    abandonment_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY SELECT * FROM get_cart_analytics(
        (NOW() - INTERVAL '30 days'),
        NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS (Row Level Security)
ALTER TABLE public.anonymous_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_cart_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for anonymous carts (allow all operations for service role)
CREATE POLICY "Allow service role full access to anonymous_carts" ON public.anonymous_carts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to anonymous_cart_items" ON public.anonymous_cart_items
    FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow anonymous users to access their own carts
CREATE POLICY "Allow anonymous access to own cart" ON public.anonymous_carts
    FOR ALL USING (
        -- Allow if no auth user (anonymous) - would need additional session-based validation in app
        auth.role() = 'anon'
    );

CREATE POLICY "Allow anonymous access to own cart items" ON public.anonymous_cart_items
    FOR ALL USING (
        -- Allow if no auth user (anonymous) - would need additional session-based validation in app
        auth.role() = 'anon'
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.anonymous_carts TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.anonymous_cart_items TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Comments for documentation
COMMENT ON TABLE public.anonymous_carts IS 'Stores anonymous user cart data for remarketing and analytics';
COMMENT ON TABLE public.anonymous_cart_items IS 'Individual items in anonymous carts';
COMMENT ON FUNCTION cleanup_expired_anonymous_carts() IS 'Cleanup function to remove expired carts - should be called via cron job';
COMMENT ON FUNCTION mark_abandoned_carts() IS 'Function to mark inactive carts as abandoned - should be called via cron job';
COMMENT ON FUNCTION get_cart_analytics(TIMESTAMPTZ, TIMESTAMPTZ) IS 'Returns analytics data for cart performance in the specified date range';
COMMENT ON FUNCTION get_cart_analytics() IS 'Returns analytics data for cart performance for the last 30 days';