-- Migration to enhance anonymous carts with missing functionality from old schema
-- This includes utility functions, triggers, and missing columns

-- 1. Add missing columns to anonymous_carts
ALTER TABLE public.anonymous_carts 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'abandoned', 'converted', 'expired')) DEFAULT 'active';

-- 2. Add missing columns to anonymous_cart_items
ALTER TABLE public.anonymous_cart_items
ADD COLUMN IF NOT EXISTS product_title TEXT,
ADD COLUMN IF NOT EXISTS product_image TEXT;

-- 3. Create or replace update_timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_anonymous_carts_updated_at ON public.anonymous_carts;
CREATE TRIGGER update_anonymous_carts_updated_at
BEFORE UPDATE ON public.anonymous_carts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_anonymous_cart_items_updated_at ON public.anonymous_cart_items;
CREATE TRIGGER update_anonymous_cart_items_updated_at
BEFORE UPDATE ON public.anonymous_cart_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Function to mark abandoned carts
CREATE OR REPLACE FUNCTION public.mark_abandoned_carts(abandonment_minutes INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    WITH abandoned_carts AS (
        UPDATE public.anonymous_carts
        SET status = 'abandoned',
            updated_at = NOW()
        WHERE status = 'active'
        AND updated_at < (NOW() - (abandonment_minutes * INTERVAL '1 minute'))
        RETURNING 1
    )
    SELECT COUNT(*) INTO updated_count FROM abandoned_carts;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to clean up expired carts
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

-- 7. Function to migrate anonymous cart to user cart
CREATE OR REPLACE FUNCTION public.migrate_anonymous_to_user_cart(
    p_session_id TEXT,
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_cart_id UUID;
    v_anonymous_cart_id UUID;
BEGIN
    -- Find the anonymous cart
    SELECT id INTO v_anonymous_cart_id
    FROM public.anonymous_carts
    WHERE session_id = p_session_id
    AND status = 'active';
    
    IF v_anonymous_cart_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Create or find user's cart
    INSERT INTO public.carts (user_id, status)
    VALUES (p_user_id, 'active')
    ON CONFLICT (user_id) 
    WHERE status = 'active'
    DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_cart_id;
    
    -- Move items from anonymous cart to user's cart
    INSERT INTO public.cart_items (cart_id, product_id, variant_id, quantity, price, product_title, product_image)
    SELECT v_cart_id, product_id, variant_id, quantity, price, product_title, product_image
    FROM public.anonymous_cart_items
    WHERE cart_id = v_anonymous_cart_id
    ON CONFLICT (cart_id, product_id, variant_id) 
    DO UPDATE SET 
        quantity = cart_items.quantity + EXCLUDED.quantity,
        updated_at = NOW();
    
    -- Mark anonymous cart as converted
    UPDATE public.anonymous_carts
    SET status = 'converted',
        updated_at = NOW()
    WHERE id = v_anonymous_cart_id;
    
    RETURN v_cart_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Function to get cart by session ID
CREATE OR REPLACE FUNCTION public.get_cart_by_session(p_session_id TEXT)
RETURNS TABLE(
    cart_id UUID,
    session_id TEXT,
    status TEXT,
    item_count INTEGER,
    total_value DECIMAL(10,2),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.id AS cart_id,
        ac.session_id,
        ac.status,
        COALESCE(SUM(aci.quantity), 0)::INTEGER AS item_count,
        COALESCE(SUM(aci.price * aci.quantity), 0)::DECIMAL(10,2) AS total_value,
        ac.created_at,
        ac.updated_at
    FROM public.anonymous_carts ac
    LEFT JOIN public.anonymous_cart_items aci ON ac.id = aci.cart_id
    WHERE ac.session_id = p_session_id
    GROUP BY ac.id;
END;
$$ LANGUAGE plpgsql;

-- 9. Function to update cart totals
CREATE OR REPLACE FUNCTION public.update_cart_totals(p_cart_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.anonymous_carts ac
    SET 
        item_count = COALESCE((
            SELECT SUM(quantity) 
            FROM public.anonymous_cart_items 
            WHERE cart_id = p_cart_id
        ), 0),
        total_value = COALESCE((
            SELECT SUM(price * quantity) 
            FROM public.anonymous_cart_items 
            WHERE cart_id = p_cart_id
        ), 0),
        updated_at = NOW()
    WHERE id = p_cart_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger to update cart totals after item changes
CREATE OR REPLACE FUNCTION public.trigger_update_cart_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.update_cart_totals(OLD.cart_id);
        RETURN OLD;
    ELSE
        PERFORM public.update_cart_totals(NEW.cart_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 11. Create triggers for cart items
DROP TRIGGER IF EXISTS update_cart_totals_after_insert ON public.anonymous_cart_items;
CREATE TRIGGER update_cart_totals_after_insert
AFTER INSERT ON public.anonymous_cart_items
FOR EACH ROW
EXECUTE FUNCTION public.trigger_update_cart_totals();

DROP TRIGGER IF EXISTS update_cart_totals_after_update ON public.anonymous_cart_items;
CREATE TRIGGER update_cart_totals_after_update
AFTER UPDATE ON public.anonymous_cart_items
FOR EACH ROW
WHEN (OLD.quantity IS DISTINCT FROM NEW.quantity OR OLD.price IS DISTINCT FROM NEW.price)
EXECUTE FUNCTION public.trigger_update_cart_totals();

DROP TRIGGER IF EXISTS update_cart_totals_after_delete ON public.anonymous_cart_items;
CREATE TRIGGER update_cart_totals_after_delete
AFTER DELETE ON public.anonymous_cart_items
FOR EACH ROW
EXECUTE FUNCTION public.trigger_update_cart_totals();

-- 12. Create RLS policies for anonymous carts
DO $$
BEGIN
    -- Allow public access to anonymous carts (with session-based access control in application)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'anonymous_carts'
        AND policyname = 'Allow public access with session check'
    ) THEN
        CREATE POLICY "Allow public access with session check" ON public.anonymous_carts
        FOR ALL
        USING (true);
    END IF;
    
    -- Allow public access to anonymous cart items (with cart ownership check)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'anonymous_cart_items'
        AND policyname = 'Allow access to own cart items'
    ) THEN
        CREATE POLICY "Allow access to own cart items" ON public.anonymous_cart_items
        FOR ALL
        USING (cart_id IN (
            SELECT id FROM public.anonymous_carts 
            WHERE session_id = current_setting('app.current_session_id', true)::TEXT
        ));
    END IF;
END $$;

-- 13. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_status ON public.anonymous_carts(status);
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_updated_at ON public.anonymous_carts(updated_at);
CREATE INDEX IF NOT EXISTS idx_anonymous_cart_items_cart_id ON public.anonymous_cart_items(cart_id);

-- 14. Add comments for documentation
COMMENT ON TABLE public.anonymous_carts IS 'Stores anonymous shopping carts for users who are not logged in';
COMMENT ON COLUMN public.anonymous_carts.status IS 'Status of the cart: active, abandoned, converted, or expired';
COMMENT ON COLUMN public.anonymous_carts.utm_source IS 'UTM source parameter for tracking marketing campaigns';
COMMENT ON COLUMN public.anonymous_carts.utm_medium IS 'UTM medium parameter for tracking marketing campaigns';
COMMENT ON COLUMN public.anonymous_carts.utm_campaign IS 'UTM campaign parameter for tracking marketing campaigns';

COMMENT ON FUNCTION public.mark_abandoned_carts(INTEGER) IS 'Marks carts as abandoned after a specified period of inactivity (default 30 minutes)';
COMMENT ON FUNCTION public.cleanup_expired_carts() IS 'Removes expired carts from the database';
COMMENT ON FUNCTION public.migrate_anonymous_to_user_cart(TEXT, UUID) IS 'Transfers an anonymous cart to a user account when they log in';
COMMENT ON FUNCTION public.get_cart_by_session(TEXT) IS 'Retrieves cart summary by session ID';
COMMENT ON FUNCTION public.update_cart_totals(UUID) IS 'Updates the item count and total value for a cart';

-- 15. Create a function to schedule cleanup jobs
CREATE OR REPLACE FUNCTION public.schedule_cart_cleanup_jobs()
RETURNS VOID AS $$
BEGIN
    -- Schedule job to mark abandoned carts (runs every hour)
    PERFORM cron.schedule(
        'mark-abandoned-carts',
        '0 * * * *',  -- Every hour at minute 0
        $$SELECT public.mark_abandoned_carts(30)$$
    );
    
    -- Schedule job to clean up expired carts (runs daily at 3 AM)
    PERFORM cron.schedule(
        'cleanup-expired-carts',
        '0 3 * * *',  -- Daily at 3 AM
        $$SELECT public.cleanup_expired_carts()$$
    );
END;
$$ LANGUAGE plpgsql;

-- 16. Create a function to unschedule cleanup jobs
CREATE OR REPLACE FUNCTION public.unschedule_cart_cleanup_jobs()
RETURNS VOID AS $$
BEGIN
    PERFORM cron.unschedule('mark-abandoned-carts');
    PERFORM cron.unschedule('cleanup-expired-carts');
END;
$$ LANGUAGE plpgsql;

-- 17. Create a function to get cart analytics
CREATE OR REPLACE FUNCTION public.get_cart_analytics(
    p_start_date TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '30 days'),
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(
    date DATE,
    active_carts INTEGER,
    abandoned_carts INTEGER,
    converted_carts INTEGER,
    avg_cart_value NUMERIC(10,2),
    avg_items_per_cart NUMERIC(10,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_stats AS (
        SELECT 
            DATE(created_at) AS date,
            COUNT(*) FILTER (WHERE status = 'active') AS active_carts,
            COUNT(*) FILTER (WHERE status = 'abandoned') AS abandoned_carts,
            COUNT(*) FILTER (WHERE status = 'converted') AS converted_carts,
            AVG(total_value) FILTER (WHERE status = 'converted') AS avg_cart_value,
            AVG(item_count) FILTER (WHERE status = 'converted') AS avg_items_per_cart
        FROM public.anonymous_carts
        WHERE created_at BETWEEN p_start_date AND p_end_date
        GROUP BY DATE(created_at)
    )
    SELECT 
        date,
        COALESCE(active_carts, 0)::INTEGER,
        COALESCE(abandoned_carts, 0)::INTEGER,
        COALESCE(converted_carts, 0)::INTEGER,
        COALESCE(avg_cart_value, 0)::NUMERIC(10,2),
        COALESCE(avg_items_per_cart, 0)::NUMERIC(10,2)
    FROM daily_stats
    ORDER BY date;
END;
$$ LANGUAGE plpgsql;

-- 18. Create a function to recover abandoned carts
CREATE OR REPLACE FUNCTION public.recover_abandoned_cart(p_session_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated_rows INTEGER;
BEGIN
    UPDATE public.anonymous_carts
    SET status = 'active',
        updated_at = NOW()
    WHERE session_id = p_session_id
    AND status = 'abandoned';
    
    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
    RETURN v_updated_rows > 0;
END;
$$ LANGUAGE plpgsql;
