-- Migration to add missing tables: addresses, reviews, and newsletter_subscriptions

-- =================================================================
-- Table: addresses
-- =================================================================
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('shipping', 'billing')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- Policies for addresses
CREATE POLICY "Users can view their own addresses" ON public.addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" ON public.addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" ON public.addresses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" ON public.addresses
    FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.addresses IS 'Stores shipping and billing addresses for users.';

-- =================================================================
-- Table: reviews
-- =================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (product_id, user_id) -- A user can only review a product once
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- Policies for reviews
CREATE POLICY "Reviews are public" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.reviews IS 'Stores customer reviews for products.';

-- =================================================================
-- Table: newsletter_subscriptions
-- =================================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for newsletter_subscriptions
CREATE POLICY "Public can subscribe to newsletter" ON public.newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service roles can manage subscriptions" ON public.newsletter_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE public.newsletter_subscriptions IS 'Stores email addresses for newsletter subscribers.';

-- =================================================================
-- Function Corrections & Updates
-- =================================================================

-- This ensures the correct, most recent version of the function is used.
-- The API code at `app/api/analytics/carts/route.ts` should be updated to call this function name.
DROP FUNCTION IF EXISTS public.cleanup_expired_anonymous_carts();

CREATE OR REPLACE FUNCTION public.cleanup_expired_carts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM public.anonymous_carts
        WHERE expires_at < NOW()
        RETURNING 1
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.cleanup_expired_carts() IS 'Removes expired carts from the database. Replaces cleanup_expired_anonymous_carts.';

-- Grant permissions for new tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT INSERT ON public.newsletter_subscriptions TO anon, authenticated;
GRANT ALL ON public.newsletter_subscriptions TO service_role;
