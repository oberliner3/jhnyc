-- Combined Schema for Supabase Project: originz
-- Generated from migration files

-- =================================================================
-- Extensions
-- =================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- =================================================================
-- Tables
-- =================================================================

-- anon cart items
CREATE TABLE IF NOT EXISTS "public"."anonymous_cart_items" (
    "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "cart_id" uuid,
    "product_id" text NOT NULL,
    "variant_id" text,
    "product_title" text,
    "product_image" text,
    "price" numeric(10, 2) NOT NULL,
    "quantity" integer NOT NULL,
    "added_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE "public"."anonymous_cart_items" ENABLE ROW LEVEL SECURITY;

-- anon carts
CREATE TABLE IF NOT EXISTS "public"."anonymous_carts" (
    "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "session_id" text NOT NULL,
    "expires_at" timestamp with time zone NOT NULL DEFAULT (now() + '7 days'::interval),
    "email" text,
    "phone" text,
    "cart_data" jsonb DEFAULT '{}'::jsonb,
    "total_value" numeric(10, 2) DEFAULT 0,
    "item_count" integer DEFAULT 0,
    "utm_source" text,
    "utm_medium" text,
    "utm_campaign" text,
    "referrer" text,
    "user_agent" text,
    "ip_address" text,
    "status" text DEFAULT 'active'::text,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE "public"."anonymous_carts" ENABLE ROW LEVEL SECURITY;

-- cart items
CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "cart_id" uuid,
    "product_id" uuid,
    "variant_id" uuid,
    "quantity" integer NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;

-- carts
CREATE TABLE IF NOT EXISTS "public"."carts" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE "public"."carts" ENABLE ROW LEVEL SECURITY;

-- order items
CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "order_id" uuid,
    "product_id" uuid,
    "variant_id" uuid,
    "quantity" integer NOT NULL,
    "price" numeric(10, 2) NOT NULL
);
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;

-- orders
CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "status" text NOT NULL DEFAULT 'Pending'::text,
    "total" numeric(10, 2) NOT NULL,
    "shipping_address" jsonb,
    "billing_address" jsonb,
    "anonymous_cart_id" UUID
);
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;

-- products
CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "title" text NOT NULL,
    "handle" text NOT NULL,
    "description" text,
    "price" numeric(10, 2) NOT NULL,
    "compare_at_price" numeric(10, 2),
    "images" jsonb NOT NULL DEFAULT '[]'::jsonb,
    "category" text,
    "in_stock" boolean NOT NULL DEFAULT true,
    "rating" numeric(2, 1) NOT NULL DEFAULT 0.0,
    "review_count" integer NOT NULL DEFAULT 0,
    "tags" text [] NOT NULL DEFAULT '{}'::text [],
    "vendor" text,
    "variants" jsonb NOT NULL DEFAULT '[]'::jsonb,
    "options" jsonb NOT NULL DEFAULT '[]'::jsonb,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" uuid NOT NULL,
    "full_name" text,
    "avatar_url" text,
    "billing_address" jsonb,
    "shipping_address" jsonb,
    "updated_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- experience_tracks
CREATE TABLE IF NOT EXISTS public.experience_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    user_id UUID,
    anonymous_id TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'click', 'scroll', 'form_interaction', 'product_view', 'add_to_cart', 'search', 'filter', 'sort', 'hover', 'video_interaction', 'image_interaction', 'checkout_step', 'error', 'performance')),
    event_name TEXT NOT NULL,
    page_url TEXT NOT NULL,
    page_title TEXT,
    element_selector TEXT,
    element_text TEXT,
    element_position JSONB,
    interaction_data JSONB DEFAULT '{}',
    custom_properties JSONB DEFAULT '{}',
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
    page_load_time INTEGER,
    time_on_page INTEGER,
    scroll_depth INTEGER,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    referrer_url TEXT,
    ip_address INET,
    country_code TEXT,
    city TEXT,
    timezone TEXT,
    client_timestamp TIMESTAMPTZ,
    server_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.experience_tracks ENABLE ROW LEVEL SECURITY;

-- user_sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT UNIQUE NOT NULL,
    user_id UUID,
    anonymous_id TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration INTEGER,
    page_views INTEGER DEFAULT 0,
    interactions INTEGER DEFAULT 0,
    entry_url TEXT,
    entry_page_title TEXT,
    exit_url TEXT,
    exit_page_title TEXT,
    user_agent TEXT,
    device_type TEXT,
    browser_name TEXT,
    os_name TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    referrer_url TEXT,
    ip_address INET,
    country_code TEXT,
    city TEXT,
    bounce BOOLEAN DEFAULT FALSE,
    converted BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- user_journeys
CREATE TABLE IF NOT EXISTS public.user_journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    anonymous_id TEXT,
    session_id TEXT,
    journey_type TEXT NOT NULL CHECK (journey_type IN ('product_discovery', 'purchase_funnel', 'onboarding', 'support', 'content_engagement')),
    journey_step TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    page_url TEXT,
    action_taken TEXT,
    time_spent INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    dropped_off BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL(10,2),
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_journeys ENABLE ROW LEVEL SECURITY;

-- performance_metrics
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    page_url TEXT NOT NULL,
    lcp DECIMAL(8,2),
    fid DECIMAL(8,2),
    cls DECIMAL(6,4),
    fcp DECIMAL(8,2),
    ttfb DECIMAL(8,2),
    dns_lookup_time INTEGER,
    tcp_connect_time INTEGER,
    tls_setup_time INTEGER,
    request_time INTEGER,
    response_time INTEGER,
    dom_processing_time INTEGER,
    load_event_time INTEGER,
    custom_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- addresses
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

-- reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (product_id, user_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- newsletter_subscriptions
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;


-- =================================================================
-- Indexes
-- =================================================================
CREATE UNIQUE INDEX IF NOT EXISTS anonymous_cart_items_pkey ON public.anonymous_cart_items USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS anonymous_carts_pkey ON public.anonymous_carts USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS anonymous_carts_session_id_key ON public.anonymous_carts USING btree (session_id);
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_pkey ON public.cart_items USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS carts_pkey ON public.carts USING btree (id);
CREATE INDEX IF NOT EXISTS idx_anonymous_cart_items_cart_id ON public.anonymous_cart_items USING btree (cart_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_cart_items_product_id ON public.anonymous_cart_items USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_cart_items_variant_id ON public.anonymous_cart_items USING btree (variant_id) WHERE (variant_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_email ON public.anonymous_carts USING btree (email) WHERE (email IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_expires_at ON public.anonymous_carts USING btree (expires_at);
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_session_id ON public.anonymous_carts USING btree (session_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_status ON public.anonymous_carts USING btree (status);
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_utm_source ON public.anonymous_carts USING btree (utm_source) WHERE (utm_source IS NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS order_items_pkey ON public.order_items USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS orders_pkey ON public.orders USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS products_handle_key ON public.products USING btree (handle);
CREATE UNIQUE INDEX IF NOT EXISTS products_pkey ON public.products USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_pkey ON public.profiles USING btree (id);
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
CREATE INDEX IF NOT EXISTS idx_anonymous_carts_updated_at ON public.anonymous_carts(updated_at);
CREATE INDEX IF NOT EXISTS idx_orders_anonymous_cart_id ON public.orders(anonymous_cart_id) WHERE anonymous_cart_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);


-- =================================================================
-- Primary Keys & Foreign Keys & Constraints
-- =================================================================

-- Primary Keys
ALTER TABLE "public"."anonymous_cart_items" ADD CONSTRAINT "anonymous_cart_items_pkey" PRIMARY KEY USING INDEX "anonymous_cart_items_pkey";
ALTER TABLE "public"."anonymous_carts" ADD CONSTRAINT "anonymous_carts_pkey" PRIMARY KEY USING INDEX "anonymous_carts_pkey";
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY USING INDEX "cart_items_pkey";
ALTER TABLE "public"."carts" ADD CONSTRAINT "carts_pkey" PRIMARY KEY USING INDEX "carts_pkey";
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_pkey" PRIMARY KEY USING INDEX "order_items_pkey";
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_pkey" PRIMARY KEY USING INDEX "orders_pkey";
ALTER TABLE "public"."products" ADD CONSTRAINT "products_pkey" PRIMARY KEY USING INDEX "products_pkey";
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_pkey" PRIMARY KEY USING INDEX "profiles_pkey";

-- Foreign Keys & Constraints
ALTER TABLE "public"."anonymous_cart_items" ADD CONSTRAINT "anonymous_cart_items_cart_id_fkey" FOREIGN KEY (cart_id) REFERENCES anonymous_carts(id) ON DELETE CASCADE;
ALTER TABLE "public"."anonymous_cart_items" ADD CONSTRAINT "anonymous_cart_items_quantity_check" CHECK ((quantity > 0));
ALTER TABLE "public"."anonymous_carts" ADD CONSTRAINT "anonymous_carts_session_id_key" UNIQUE USING INDEX "anonymous_carts_session_id_key";
ALTER TABLE "public"."anonymous_carts" ADD CONSTRAINT "anonymous_carts_status_check" CHECK (((status = ANY (ARRAY['active'::text, 'abandoned'::text, 'converted'::text, 'expired'::text]))));
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE;
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE "public"."carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE "public"."orders" ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_anonymous_cart_id_fkey" FOREIGN KEY (anonymous_cart_id) REFERENCES public.anonymous_carts(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE "public"."orders" ADD CONSTRAINT orders_user_or_anonymous_check CHECK (((user_id IS NOT NULL) OR (anonymous_cart_id IS NOT NULL)));
ALTER TABLE "public"."products" ADD CONSTRAINT "products_handle_key" UNIQUE USING INDEX "products_handle_key";
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- =================================================================
-- Functions
-- =================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_cart_analytics(p_start_date timestamp with time zone, p_end_date timestamp with time zone)
RETURNS TABLE(date DATE, active_carts INTEGER, abandoned_carts INTEGER, converted_carts INTEGER, avg_cart_value NUMERIC(10,2), avg_items_per_cart NUMERIC(10,2))
LANGUAGE plpgsql AS $function$
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
        ds.date,
        COALESCE(ds.active_carts, 0)::INTEGER,
        COALESCE(ds.abandoned_carts, 0)::INTEGER,
        COALESCE(ds.converted_carts, 0)::INTEGER,
        COALESCE(ds.avg_cart_value, 0)::NUMERIC(10,2),
        COALESCE(ds.avg_items_per_cart, 0)::NUMERIC(10,2)
    FROM daily_stats ds
    ORDER BY ds.date;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_cart_analytics()
RETURNS TABLE(date DATE, active_carts INTEGER, abandoned_carts INTEGER, converted_carts INTEGER, avg_cart_value NUMERIC(10,2), avg_items_per_cart NUMERIC(10,2))
LANGUAGE plpgsql AS $function$
BEGIN
    RETURN QUERY SELECT * FROM public.get_cart_analytics(
        (NOW() - INTERVAL '30 days'),
        NOW()
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_abandoned_carts(abandonment_minutes INTEGER DEFAULT 30)
RETURNS INTEGER LANGUAGE plpgsql AS $function$
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
$function$;

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

CREATE OR REPLACE FUNCTION update_session_stats()
RETURNS TRIGGER AS $$
BEGIN
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

CREATE OR REPLACE FUNCTION mark_bounce_sessions()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.user_sessions 
    SET bounce = TRUE, updated_at = NOW()
    WHERE page_views <= 1 
      AND duration < 30 
      AND bounce = FALSE
      AND ended_at < (NOW() - INTERVAL '5 minutes');
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_funnel_conversion(p_journey_type TEXT, p_start_date TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '30 days'), p_end_date TIMESTAMPTZ DEFAULT NOW())
RETURNS TABLE (step TEXT, step_order INTEGER, users BIGINT, conversion_rate DECIMAL) AS $$
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

CREATE OR REPLACE FUNCTION get_user_behavior_insights(p_start_date TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '7 days'), p_end_date TIMESTAMPTZ DEFAULT NOW())
RETURNS TABLE (metric_name TEXT, metric_value DECIMAL, metric_unit TEXT, comparison_period_value DECIMAL, change_percentage DECIMAL) AS $$
BEGIN
    RETURN QUERY
    WITH current_period AS (
        SELECT 
            COUNT(DISTINCT session_id) as total_sessions,
            AVG(CASE WHEN event_type = 'page_view' THEN time_on_page END) as avg_time_on_page,
            AVG(scroll_depth) as avg_scroll_depth
        FROM public.experience_tracks
        WHERE created_at BETWEEN p_start_date AND p_end_date
    ),
    previous_period AS (
        SELECT 
            COUNT(DISTINCT session_id) as total_sessions,
            AVG(CASE WHEN event_type = 'page_view' THEN time_on_page END) as avg_time_on_page,
            AVG(scroll_depth) as avg_scroll_depth
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
        CASE WHEN pp.total_sessions > 0 THEN ROUND(((cp.total_sessions - pp.total_sessions)::DECIMAL / pp.total_sessions) * 100, 2) ELSE 0 END
    FROM current_period cp, previous_period pp
    UNION ALL
    SELECT 
        'Average Time on Page'::TEXT,
        ROUND(cp.avg_time_on_page, 2),
        'seconds'::TEXT,
        ROUND(pp.avg_time_on_page, 2),
        CASE WHEN pp.avg_time_on_page > 0 THEN ROUND(((cp.avg_time_on_page - pp.avg_time_on_page) / pp.avg_time_on_page) * 100, 2) ELSE 0 END
    FROM current_period cp, previous_period pp
    UNION ALL
    SELECT 
        'Average Scroll Depth'::TEXT,
        ROUND(cp.avg_scroll_depth, 2),
        'percentage'::TEXT,
        ROUND(pp.avg_scroll_depth, 2),
        CASE WHEN pp.avg_scroll_depth > 0 THEN ROUND(((cp.avg_scroll_depth - pp.avg_scroll_depth) / pp.avg_scroll_depth) * 100, 2) ELSE 0 END
    FROM current_period cp, previous_period pp;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_old_experience_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.experience_tracks WHERE created_at < (NOW() - INTERVAL '90 days');
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    DELETE FROM public.user_sessions WHERE created_at < (NOW() - INTERVAL '90 days');
    DELETE FROM public.performance_metrics WHERE created_at < (NOW() - INTERVAL '30 days');
    DELETE FROM public.user_journeys WHERE created_at < (NOW() - INTERVAL '90 days');
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION public.migrate_anonymous_to_user_cart(p_session_id TEXT, p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    v_cart_id UUID;
    v_anonymous_cart_id UUID;
BEGIN
    SELECT id INTO v_anonymous_cart_id
    FROM public.anonymous_carts
    WHERE session_id = p_session_id
    AND status = 'active';
    
    IF v_anonymous_cart_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    INSERT INTO public.carts (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id)
    DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_cart_id;
    
    INSERT INTO public.cart_items (cart_id, product_id, variant_id, quantity)
    SELECT v_cart_id, product_id::uuid, variant_id::uuid, quantity
    FROM public.anonymous_cart_items
    WHERE cart_id = v_anonymous_cart_id
    ON CONFLICT (cart_id, product_id, variant_id) 
    DO UPDATE SET 
        quantity = cart_items.quantity + EXCLUDED.quantity,
        updated_at = NOW();
    
    UPDATE public.anonymous_carts
    SET status = 'converted',
        updated_at = NOW()
    WHERE id = v_anonymous_cart_id;
    
    RETURN v_cart_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_cart_by_session(p_session_id TEXT)
RETURNS TABLE(cart_id UUID, session_id TEXT, status TEXT, item_count INTEGER, total_value DECIMAL(10,2), created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) AS $$
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

CREATE OR REPLACE FUNCTION public.schedule_cart_cleanup_jobs()
RETURNS VOID AS $$
BEGIN
    PERFORM cron.schedule('mark-abandoned-carts', '0 * * * *', $$SELECT public.mark_abandoned_carts(30)$$);
    PERFORM cron.schedule('cleanup-expired-carts', '0 3 * * *', $$SELECT public.cleanup_expired_carts()$$);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.unschedule_cart_cleanup_jobs()
RETURNS VOID AS $$
BEGIN
    PERFORM cron.unschedule('mark-abandoned-carts');
    PERFORM cron.unschedule('cleanup-expired-carts');
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION public.create_anonymous_order(p_anonymous_cart_id UUID, p_shipping_address JSONB, p_billing_address JSONB, p_payment_method TEXT, p_status TEXT DEFAULT 'pending')
RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_cart_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.anonymous_carts
        WHERE id = p_anonymous_cart_id AND status = 'active'
    ) INTO v_cart_exists;

    IF NOT v_cart_exists THEN
        RAISE EXCEPTION 'Invalid or inactive anonymous cart';
    END IF;

    INSERT INTO public.orders (anonymous_cart_id, status, shipping_address, billing_address, payment_method, created_at, updated_at, total)
    VALUES (p_anonymous_cart_id, p_status, p_shipping_address, p_billing_address, p_payment_method, NOW(), NOW(), (SELECT total_value FROM public.anonymous_carts WHERE id = p_anonymous_cart_id))
    RETURNING id INTO v_order_id;

    UPDATE public.anonymous_carts
    SET status = 'converted', updated_at = NOW()
    WHERE id = p_anonymous_cart_id;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_order_with_cart(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'order_id', o.id,
        'status', o.status,
        'created_at', o.created_at,
        'updated_at', o.updated_at,
        'shipping_address', o.shipping_address,
        'billing_address', o.billing_address,
        'payment_method', o.payment_method,
        'is_guest_order', o.user_id IS NULL,
        'cart', CASE
            WHEN o.anonymous_cart_id IS NOT NULL THEN (
                SELECT jsonb_build_object(
                    'cart_id', ac.id,
                    'session_id', ac.session_id,
                    'created_at', ac.created_at,
                    'items', COALESCE((
                        SELECT jsonb_agg(jsonb_build_object(
                            'product_id', aci.product_id,
                            'variant_id', aci.variant_id,
                            'product_title', aci.product_title,
                            'product_image', aci.product_image,
                            'price', aci.price,
                            'quantity', aci.quantity
                        ))
                        FROM public.anonymous_cart_items aci
                        WHERE aci.cart_id = ac.id
                    ), '[]'::jsonb)
                )
                FROM public.anonymous_carts ac
                WHERE ac.id = o.anonymous_cart_id
            )
            ELSE NULL
        END,
        'user', CASE
            WHEN o.user_id IS NOT NULL THEN (
                SELECT jsonb_build_object('id', u.id, 'email', u.email)
                FROM auth.users u
                WHERE u.id = o.user_id
            )
            ELSE NULL
        END
    ) INTO v_result
    FROM public.orders o
    WHERE o.id = p_order_id;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.sync_order_cart_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'converted' AND OLD.status != 'converted' THEN
        UPDATE public.orders
        SET status = 'processing', updated_at = NOW()
        WHERE anonymous_cart_id = NEW.id AND status = 'pending';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =================================================================
-- Triggers
-- =================================================================
DROP TRIGGER IF EXISTS trigger_update_anonymous_cart_items_updated_at ON public.anonymous_cart_items;
CREATE TRIGGER trigger_update_anonymous_cart_items_updated_at BEFORE UPDATE ON public.anonymous_cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_cart_totals_on_delete ON public.anonymous_cart_items;
CREATE TRIGGER trigger_update_cart_totals_on_delete AFTER DELETE ON public.anonymous_cart_items FOR EACH ROW EXECUTE FUNCTION public.trigger_update_cart_totals();

DROP TRIGGER IF EXISTS trigger_update_cart_totals_on_insert ON public.anonymous_cart_items;
CREATE TRIGGER trigger_update_cart_totals_on_insert AFTER INSERT ON public.anonymous_cart_items FOR EACH ROW EXECUTE FUNCTION public.trigger_update_cart_totals();

DROP TRIGGER IF EXISTS trigger_update_cart_totals_on_update ON public.anonymous_cart_items;
CREATE TRIGGER trigger_update_cart_totals_on_update AFTER UPDATE ON public.anonymous_cart_items FOR EACH ROW WHEN (OLD.quantity IS DISTINCT FROM NEW.quantity OR OLD.price IS DISTINCT FROM NEW.price) EXECUTE FUNCTION public.trigger_update_cart_totals();

DROP TRIGGER IF EXISTS trigger_update_anonymous_carts_updated_at ON public.anonymous_carts;
CREATE TRIGGER trigger_update_anonymous_carts_updated_at BEFORE UPDATE ON public.anonymous_carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_session_stats ON public.experience_tracks;
CREATE TRIGGER trigger_update_session_stats AFTER INSERT ON public.experience_tracks FOR EACH ROW EXECUTE FUNCTION update_session_stats();

DROP TRIGGER IF EXISTS trg_sync_order_cart_status ON public.anonymous_carts;
CREATE TRIGGER trg_sync_order_cart_status AFTER UPDATE OF status ON public.anonymous_carts FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status) EXECUTE FUNCTION public.sync_order_cart_status();


-- =================================================================
-- RLS Policies
-- =================================================================

-- Policies for anonymous_cart_items
CREATE POLICY "Allow anonymous access to own cart items" ON "public"."anonymous_cart_items" AS permissive FOR ALL TO public USING ((auth.role() = 'anon'::text));
CREATE POLICY "Allow service role full access to anonymous_cart_items" ON "public"."anonymous_cart_items" AS permissive FOR ALL TO public USING ((auth.role() = 'service_role'::text));
CREATE POLICY "Allow access to own cart items" ON public.anonymous_cart_items FOR ALL USING (cart_id IN (SELECT id FROM public.anonymous_carts WHERE session_id = current_setting('app.current_session_id', true)::TEXT));

-- Policies for anonymous_carts
CREATE POLICY "Allow anonymous access to own cart" ON "public"."anonymous_carts" AS permissive FOR ALL TO public USING ((auth.role() = 'anon'::text));
CREATE POLICY "Allow service role full access to anonymous_carts" ON "public"."anonymous_carts" AS permissive FOR ALL TO public USING ((auth.role() = 'service_role'::text));
CREATE POLICY "Allow public access with session check" ON public.anonymous_carts FOR ALL USING (true);

-- Policies for cart_items
CREATE POLICY "Cart items are viewable by cart owner." ON "public"."cart_items" AS permissive FOR SELECT TO public USING ((EXISTS (SELECT 1 FROM carts WHERE ((carts.id = cart_items.cart_id) AND (carts.user_id = auth.uid())))));
CREATE POLICY "Users can delete cart items from their cart." ON "public"."cart_items" AS permissive FOR DELETE TO public USING ((EXISTS (SELECT 1 FROM carts WHERE ((carts.id = cart_items.cart_id) AND (carts.user_id = auth.uid())))));
CREATE POLICY "Users can insert cart items for their cart." ON "public"."cart_items" AS permissive FOR INSERT TO public WITH CHECK ((EXISTS (SELECT 1 FROM carts WHERE ((carts.id = cart_items.cart_id) AND (carts.user_id = auth.uid())))));
CREATE POLICY "Users can update cart items for their cart." ON "public"."cart_items" AS permissive FOR UPDATE TO public USING ((EXISTS (SELECT 1 FROM carts WHERE ((carts.id = cart_items.cart_id) AND (carts.user_id = auth.uid())))));

-- Policies for carts
CREATE POLICY "Users can create their own cart." ON "public"."carts" AS permissive FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update their own cart." ON "public"."carts" AS permissive FOR UPDATE TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own cart." ON "public"."carts" AS permissive FOR SELECT TO public USING ((auth.uid() = user_id));

-- Policies for order_items
CREATE POLICY "Order items are viewable by order owner." ON "public"."order_items" AS permissive FOR SELECT TO public USING ((EXISTS (SELECT 1 FROM orders WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));
CREATE POLICY "Users can insert order items for their orders." ON "public"."order_items" AS permissive FOR INSERT TO public WITH CHECK ((EXISTS (SELECT 1 FROM orders WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));

-- Policies for orders
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow anonymous order creation" ON public.orders FOR INSERT WITH CHECK ((anonymous_cart_id IS NOT NULL AND user_id IS NULL));
CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (status IS NOT DISTINCT FROM CASE WHEN OLD.status = 'pending' AND NEW.status IN ('processing', 'cancelled') THEN NEW.status WHEN OLD.status = 'processing' AND NEW.status IN ('shipped', 'completed', 'cancelled') THEN NEW.status ELSE OLD.status END);

-- Policies for products
CREATE POLICY "Products are viewable by everyone." ON "public"."products" AS permissive FOR SELECT TO public USING (true);

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" AS permissive FOR SELECT TO public USING (true);
CREATE POLICY "Users can insert their own profile." ON "public"."profiles" AS permissive FOR INSERT TO public WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can update their own profile." ON "public"."profiles" AS permissive FOR UPDATE TO public USING ((auth.uid() = id));

-- Policies for experience_tracks
CREATE POLICY "Allow service role full access to experience_tracks" ON public.experience_tracks FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow authenticated access to experience_tracks" ON public.experience_tracks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow anonymous access to experience_tracks" ON public.experience_tracks FOR INSERT USING (auth.role() = 'anon');

-- Policies for user_sessions
CREATE POLICY "Allow service role full access to user_sessions" ON public.user_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow authenticated access to user_sessions" ON public.user_sessions FOR ALL USING (auth.role() = 'authenticated');

-- Policies for user_journeys
CREATE POLICY "Allow service role full access to user_journeys" ON public.user_journeys FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow authenticated access to user_journeys" ON public.user_journeys FOR ALL USING (auth.role() = 'authenticated');

-- Policies for performance_metrics
CREATE POLICY "Allow service role full access to performance_metrics" ON public.performance_metrics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow authenticated access to performance_metrics" ON public.performance_metrics FOR ALL USING (auth.role() = 'authenticated');

-- Policies for addresses
CREATE POLICY "Users can view their own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

-- Policies for reviews
CREATE POLICY "Reviews are public" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Policies for newsletter_subscriptions
CREATE POLICY "Public can subscribe to newsletter" ON public.newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service roles can manage subscriptions" ON public.newsletter_subscriptions FOR ALL USING (auth.role() = 'service_role');


-- =================================================================
-- Comments
-- =================================================================
COMMENT ON TABLE public.anonymous_carts IS 'Stores anonymous shopping carts for users who are not logged in';
COMMENT ON COLUMN public.anonymous_carts.status IS 'Status of the cart: active, abandoned, converted, or expired';
COMMENT ON COLUMN public.anonymous_carts.utm_source IS 'UTM source parameter for tracking marketing campaigns';
COMMENT ON COLUMN public.anonymous_carts.utm_medium IS 'UTM medium parameter for tracking marketing campaigns';
COMMENT ON COLUMN public.anonymous_carts.utm_campaign IS 'UTM campaign parameter for tracking marketing campaigns';
COMMENT ON FUNCTION public.mark_abandoned_carts(INTEGER) IS 'Marks carts as abandoned after a specified period of inactivity (default 30 minutes)';
COMMENT ON FUNCTION public.cleanup_expired_carts() IS 'Removes expired carts from the database. Replaces cleanup_expired_anonymous_carts.';
COMMENT ON FUNCTION public.migrate_anonymous_to_user_cart(TEXT, UUID) IS 'Transfers an anonymous cart to a user account when they log in';
COMMENT ON FUNCTION public.get_cart_by_session(TEXT) IS 'Retrieves cart summary by session ID';
COMMENT ON FUNCTION public.update_cart_totals(UUID) IS 'Updates the item count and total value for a cart';
COMMENT ON TABLE public.experience_tracks IS 'Detailed tracking of user interactions and behavior';
COMMENT ON TABLE public.user_sessions IS 'Session-level aggregated data for user visits';
COMMENT ON TABLE public.user_journeys IS 'User journey and funnel tracking for conversion analysis';
COMMENT ON TABLE public.performance_metrics IS 'Core Web Vitals and performance metrics tracking';
COMMENT ON FUNCTION update_session_stats() IS 'Automatically updates session statistics when experience tracks are added';
COMMENT ON FUNCTION mark_bounce_sessions() IS 'Identifies and marks bounce sessions based on behavior';
COMMENT ON FUNCTION calculate_funnel_conversion(TEXT, TIMESTAMPTZ, TIMESTAMPTZ) IS 'Calculates conversion rates for user journey funnels';
COMMENT ON FUNCTION get_user_behavior_insights(TIMESTAMPTZ, TIMESTAMPTZ) IS 'Provides behavioral insights with period-over-period comparison';
COMMENT ON FUNCTION cleanup_old_experience_data() IS 'Cleans up old tracking data to manage database size';
COMMENT ON COLUMN public.orders.anonymous_cart_id IS 'Reference to the anonymous cart for guest checkouts';
COMMENT ON CONSTRAINT orders_user_or_anonymous_check ON public.orders IS 'Ensures that either user_id or anonymous_cart_id is provided';
COMMENT ON FUNCTION public.create_anonymous_order IS 'Creates an order from an anonymous cart for guest checkouts';
COMMENT ON FUNCTION public.get_order_with_cart IS 'Retrieves order details with associated cart information';
COMMENT ON TABLE public.addresses IS 'Stores shipping and billing addresses for users.';
COMMENT ON TABLE public.reviews IS 'Stores customer reviews for products.';
COMMENT ON TABLE public.newsletter_subscriptions IS 'Stores email addresses for newsletter subscribers.';