create type "public"."experience_track_actions" as enum ('focus', 'blur', 'change', 'submit', 'error');

create type "public"."experience_track_errors" as enum ('javascript', 'network', 'validation', '404', '500', 'other', 'api');

create table "public"."addresses" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "type" text not null,
    "first_name" text not null,
    "last_name" text not null,
    "address" text not null,
    "city" text not null,
    "postal_code" text not null,
    "country" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."addresses" enable row level security;

create table "public"."anonymous_cart_items" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "cart_id" uuid,
    "product_id" integer not null,
    "variant_id" integer,
    "product_title" text,
    "product_image" text,
    "price" numeric(10,2) not null,
    "quantity" integer not null,
    "added_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."anonymous_cart_items" enable row level security;

create table "public"."anonymous_carts" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "session_id" text not null,
    "expires_at" timestamp with time zone not null default (now() + '7 days'::interval),
    "email" text,
    "phone" text,
    "cart_data" jsonb default '{}'::jsonb,
    "total_value" numeric(10,2) default 0,
    "item_count" integer default 0,
    "utm_source" text,
    "utm_medium" text,
    "utm_campaign" text,
    "referrer" text,
    "user_agent" text,
    "ip_address" text,
    "status" text default 'active'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."anonymous_carts" enable row level security;

create table "public"."cart_items" (
    "id" uuid not null default gen_random_uuid(),
    "cart_id" uuid,
    "product_id" integer,
    "variant_id" integer,
    "quantity" integer not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."cart_items" enable row level security;

create table "public"."carts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."carts" enable row level security;

create table "public"."experience_tracks" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "session_id" text not null,
    "user_id" uuid,
    "anonymous_id" text,
    "event_type" text not null,
    "event_name" text not null,
    "page_url" text not null,
    "page_title" text,
    "element_selector" text,
    "element_text" text,
    "element_position" jsonb,
    "interaction_data" jsonb default '{}'::jsonb,
    "custom_properties" jsonb default '{}'::jsonb,
    "user_agent" text,
    "viewport_width" integer,
    "viewport_height" integer,
    "screen_width" integer,
    "screen_height" integer,
    "device_type" text,
    "browser_name" text,
    "browser_version" text,
    "os_name" text,
    "os_version" text,
    "page_load_time" integer,
    "time_on_page" integer,
    "scroll_depth" integer,
    "utm_source" text,
    "utm_medium" text,
    "utm_campaign" text,
    "utm_term" text,
    "utm_content" text,
    "referrer_url" text,
    "ip_address" inet,
    "country_code" text,
    "city" text,
    "timezone" text,
    "client_timestamp" timestamp with time zone,
    "server_timestamp" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now(),
    "action" experience_track_actions
);


alter table "public"."experience_tracks" enable row level security;

create table "public"."newsletter_subscriptions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "email" text not null,
    "subscribed_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."newsletter_subscriptions" enable row level security;

create table "public"."order_items" (
    "id" uuid not null default gen_random_uuid(),
    "order_id" uuid,
    "product_id" integer,
    "variant_id" integer,
    "quantity" integer not null,
    "price" numeric(10,2) not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."order_items" enable row level security;

create table "public"."order_status_history" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "order_id" uuid not null,
    "old_status" text,
    "new_status" text not null,
    "changed_by" uuid,
    "notes" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."order_status_history" enable row level security;

create table "public"."orders" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "status" text not null default 'Pending'::text,
    "total" numeric(10,2) not null,
    "shipping_address" jsonb,
    "billing_address" jsonb,
    "anonymous_cart_id" uuid,
    "payment_method" text
);


alter table "public"."orders" enable row level security;

create table "public"."performance_metrics" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "session_id" text not null,
    "page_url" text not null,
    "lcp" numeric(8,2),
    "fid" numeric(8,2),
    "cls" numeric(6,4),
    "fcp" numeric(8,2),
    "ttfb" numeric(8,2),
    "dns_lookup_time" integer,
    "tcp_connect_time" integer,
    "tls_setup_time" integer,
    "request_time" integer,
    "response_time" integer,
    "dom_processing_time" integer,
    "load_event_time" integer,
    "custom_metrics" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."performance_metrics" enable row level security;

create table "public"."profiles" (
    "id" uuid not null,
    "full_name" text,
    "avatar_url" text,
    "billing_address" jsonb,
    "shipping_address" jsonb,
    "updated_at" timestamp with time zone default now()
);


alter table "public"."profiles" enable row level security;

create table "public"."reviews" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "product_id" integer not null,
    "user_id" uuid not null,
    "rating" integer not null,
    "comment" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."reviews" enable row level security;

create table "public"."user_journeys" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "anonymous_id" text,
    "session_id" text,
    "journey_type" text not null,
    "journey_step" text not null,
    "step_order" integer not null,
    "page_url" text,
    "action_taken" text,
    "time_spent" integer,
    "completed" boolean default false,
    "dropped_off" boolean default false,
    "conversion_value" numeric(10,2),
    "properties" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."user_journeys" enable row level security;

create table "public"."user_sessions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "session_id" text not null,
    "user_id" uuid,
    "anonymous_id" text,
    "started_at" timestamp with time zone default now(),
    "ended_at" timestamp with time zone,
    "duration" integer,
    "page_views" integer default 0,
    "interactions" integer default 0,
    "entry_url" text,
    "entry_page_title" text,
    "exit_url" text,
    "exit_page_title" text,
    "user_agent" text,
    "device_type" text,
    "browser_name" text,
    "os_name" text,
    "utm_source" text,
    "utm_medium" text,
    "utm_campaign" text,
    "referrer_url" text,
    "ip_address" inet,
    "country_code" text,
    "city" text,
    "bounce" boolean default false,
    "converted" boolean default false,
    "conversion_value" numeric(10,2),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."user_sessions" enable row level security;

CREATE UNIQUE INDEX addresses_pkey ON public.addresses USING btree (id);

CREATE UNIQUE INDEX anonymous_cart_items_pkey ON public.anonymous_cart_items USING btree (id);

CREATE UNIQUE INDEX anonymous_carts_pkey ON public.anonymous_carts USING btree (id);

CREATE UNIQUE INDEX anonymous_carts_session_id_key ON public.anonymous_carts USING btree (session_id);

CREATE UNIQUE INDEX cart_items_cart_product_variant_key ON public.cart_items USING btree (cart_id, product_id, COALESCE(variant_id, 0));

CREATE UNIQUE INDEX cart_items_pkey ON public.cart_items USING btree (id);

CREATE UNIQUE INDEX carts_pkey ON public.carts USING btree (id);

CREATE UNIQUE INDEX carts_user_id_key ON public.carts USING btree (user_id);

CREATE UNIQUE INDEX experience_tracks_pkey ON public.experience_tracks USING btree (id);

CREATE INDEX idx_addresses_user_id ON public.addresses USING btree (user_id);

CREATE INDEX idx_anonymous_cart_items_cart_id ON public.anonymous_cart_items USING btree (cart_id);

CREATE INDEX idx_anonymous_cart_items_product_id ON public.anonymous_cart_items USING btree (product_id);

CREATE INDEX idx_anonymous_cart_items_variant_id ON public.anonymous_cart_items USING btree (variant_id) WHERE (variant_id IS NOT NULL);

CREATE INDEX idx_anonymous_carts_cart_data_gin ON public.anonymous_carts USING gin (cart_data);

CREATE INDEX idx_anonymous_carts_email ON public.anonymous_carts USING btree (email) WHERE (email IS NOT NULL);

CREATE INDEX idx_anonymous_carts_expires_at ON public.anonymous_carts USING btree (expires_at);

CREATE INDEX idx_anonymous_carts_session_id ON public.anonymous_carts USING btree (session_id);

CREATE INDEX idx_anonymous_carts_status ON public.anonymous_carts USING btree (status);

CREATE INDEX idx_anonymous_carts_status_created_at ON public.anonymous_carts USING btree (status, created_at);

CREATE INDEX idx_anonymous_carts_updated_at ON public.anonymous_carts USING btree (updated_at);

CREATE INDEX idx_anonymous_carts_utm_source ON public.anonymous_carts USING btree (utm_source) WHERE (utm_source IS NOT NULL);

CREATE INDEX idx_cart_items_cart_id ON public.cart_items USING btree (cart_id);

CREATE INDEX idx_cart_items_product_id ON public.cart_items USING btree (product_id);

CREATE INDEX idx_cart_items_variant_id ON public.cart_items USING btree (variant_id) WHERE (variant_id IS NOT NULL);

CREATE INDEX idx_carts_user_id ON public.carts USING btree (user_id);

CREATE INDEX idx_experience_tracks_anonymous_id ON public.experience_tracks USING btree (anonymous_id) WHERE (anonymous_id IS NOT NULL);

CREATE INDEX idx_experience_tracks_created_at ON public.experience_tracks USING btree (created_at);

CREATE INDEX idx_experience_tracks_event_type ON public.experience_tracks USING btree (event_type);

CREATE INDEX idx_experience_tracks_page_url ON public.experience_tracks USING btree (page_url);

CREATE INDEX idx_experience_tracks_properties_gin ON public.experience_tracks USING gin (custom_properties);

CREATE INDEX idx_experience_tracks_session_event ON public.experience_tracks USING btree (session_id, event_type, created_at);

CREATE INDEX idx_experience_tracks_session_id ON public.experience_tracks USING btree (session_id);

CREATE INDEX idx_experience_tracks_user_id ON public.experience_tracks USING btree (user_id) WHERE (user_id IS NOT NULL);

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);

CREATE INDEX idx_order_items_product_id ON public.order_items USING btree (product_id);

CREATE INDEX idx_order_items_variant_id ON public.order_items USING btree (variant_id) WHERE (variant_id IS NOT NULL);

CREATE INDEX idx_order_status_history_order_id ON public.order_status_history USING btree (order_id);

CREATE INDEX idx_orders_anonymous_cart_id ON public.orders USING btree (anonymous_cart_id) WHERE (anonymous_cart_id IS NOT NULL);

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);

CREATE INDEX idx_orders_status ON public.orders USING btree (status);

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id) WHERE (user_id IS NOT NULL);

CREATE INDEX idx_orders_user_status ON public.orders USING btree (user_id, status) WHERE (user_id IS NOT NULL);

CREATE INDEX idx_performance_metrics_created_at ON public.performance_metrics USING btree (created_at);

CREATE INDEX idx_performance_metrics_page_url ON public.performance_metrics USING btree (page_url);

CREATE INDEX idx_performance_metrics_session_id ON public.performance_metrics USING btree (session_id);

CREATE INDEX idx_reviews_product_id ON public.reviews USING btree (product_id);

CREATE INDEX idx_reviews_user_id ON public.reviews USING btree (user_id);

CREATE INDEX idx_user_journeys_anonymous_id ON public.user_journeys USING btree (anonymous_id) WHERE (anonymous_id IS NOT NULL);

CREATE INDEX idx_user_journeys_journey_type ON public.user_journeys USING btree (journey_type);

CREATE INDEX idx_user_journeys_session_id ON public.user_journeys USING btree (session_id);

CREATE INDEX idx_user_journeys_user_id ON public.user_journeys USING btree (user_id) WHERE (user_id IS NOT NULL);

CREATE INDEX idx_user_sessions_session_id ON public.user_sessions USING btree (session_id);

CREATE INDEX idx_user_sessions_started_at ON public.user_sessions USING btree (started_at);

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id) WHERE (user_id IS NOT NULL);

CREATE UNIQUE INDEX newsletter_subscriptions_email_key ON public.newsletter_subscriptions USING btree (email);

CREATE UNIQUE INDEX newsletter_subscriptions_pkey ON public.newsletter_subscriptions USING btree (id);

CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);

CREATE UNIQUE INDEX order_status_history_pkey ON public.order_status_history USING btree (id);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE UNIQUE INDEX performance_metrics_pkey ON public.performance_metrics USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (id);

CREATE UNIQUE INDEX reviews_product_id_user_id_key ON public.reviews USING btree (product_id, user_id);

CREATE UNIQUE INDEX user_journeys_pkey ON public.user_journeys USING btree (id);

CREATE UNIQUE INDEX user_sessions_pkey ON public.user_sessions USING btree (id);

CREATE UNIQUE INDEX user_sessions_session_id_key ON public.user_sessions USING btree (session_id);

alter table "public"."addresses" add constraint "addresses_pkey" PRIMARY KEY using index "addresses_pkey";

alter table "public"."anonymous_cart_items" add constraint "anonymous_cart_items_pkey" PRIMARY KEY using index "anonymous_cart_items_pkey";

alter table "public"."anonymous_carts" add constraint "anonymous_carts_pkey" PRIMARY KEY using index "anonymous_carts_pkey";

alter table "public"."cart_items" add constraint "cart_items_pkey" PRIMARY KEY using index "cart_items_pkey";

alter table "public"."carts" add constraint "carts_pkey" PRIMARY KEY using index "carts_pkey";

alter table "public"."experience_tracks" add constraint "experience_tracks_pkey" PRIMARY KEY using index "experience_tracks_pkey";

alter table "public"."newsletter_subscriptions" add constraint "newsletter_subscriptions_pkey" PRIMARY KEY using index "newsletter_subscriptions_pkey";

alter table "public"."order_items" add constraint "order_items_pkey" PRIMARY KEY using index "order_items_pkey";

alter table "public"."order_status_history" add constraint "order_status_history_pkey" PRIMARY KEY using index "order_status_history_pkey";

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."performance_metrics" add constraint "performance_metrics_pkey" PRIMARY KEY using index "performance_metrics_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."reviews" add constraint "reviews_pkey" PRIMARY KEY using index "reviews_pkey";

alter table "public"."user_journeys" add constraint "user_journeys_pkey" PRIMARY KEY using index "user_journeys_pkey";

alter table "public"."user_sessions" add constraint "user_sessions_pkey" PRIMARY KEY using index "user_sessions_pkey";

alter table "public"."addresses" add constraint "addresses_type_check" CHECK ((type = ANY (ARRAY['shipping'::text, 'billing'::text]))) not valid;

alter table "public"."addresses" validate constraint "addresses_type_check";

alter table "public"."addresses" add constraint "addresses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."addresses" validate constraint "addresses_user_id_fkey";

alter table "public"."anonymous_cart_items" add constraint "anonymous_cart_items_cart_id_fkey" FOREIGN KEY (cart_id) REFERENCES anonymous_carts(id) ON DELETE CASCADE not valid;

alter table "public"."anonymous_cart_items" validate constraint "anonymous_cart_items_cart_id_fkey";

alter table "public"."anonymous_cart_items" add constraint "anonymous_cart_items_quantity_check" CHECK ((quantity > 0)) not valid;

alter table "public"."anonymous_cart_items" validate constraint "anonymous_cart_items_quantity_check";

alter table "public"."anonymous_carts" add constraint "anonymous_carts_email_valid" CHECK (((email IS NULL) OR (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))) not valid;

alter table "public"."anonymous_carts" validate constraint "anonymous_carts_email_valid";

alter table "public"."anonymous_carts" add constraint "anonymous_carts_session_id_key" UNIQUE using index "anonymous_carts_session_id_key";

alter table "public"."anonymous_carts" add constraint "anonymous_carts_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'abandoned'::text, 'converted'::text, 'expired'::text]))) not valid;

alter table "public"."anonymous_carts" validate constraint "anonymous_carts_status_check";

alter table "public"."cart_items" add constraint "cart_items_cart_id_fkey" FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE not valid;

alter table "public"."cart_items" validate constraint "cart_items_cart_id_fkey";

alter table "public"."carts" add constraint "carts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."carts" validate constraint "carts_user_id_fkey";

alter table "public"."experience_tracks" add constraint "experience_tracks_event_type_check" CHECK ((event_type = ANY (ARRAY['page_view'::text, 'click'::text, 'scroll'::text, 'form_interaction'::text, 'product_view'::text, 'add_to_cart'::text, 'search'::text, 'filter'::text, 'sort'::text, 'hover'::text, 'video_interaction'::text, 'image_interaction'::text, 'checkout_step'::text, 'error'::text, 'performance'::text]))) not valid;

alter table "public"."experience_tracks" validate constraint "experience_tracks_event_type_check";

alter table "public"."newsletter_subscriptions" add constraint "newsletter_subscriptions_email_key" UNIQUE using index "newsletter_subscriptions_email_key";

alter table "public"."newsletter_subscriptions" add constraint "newsletter_subscriptions_email_valid" CHECK ((email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)) not valid;

alter table "public"."newsletter_subscriptions" validate constraint "newsletter_subscriptions_email_valid";

alter table "public"."order_items" add constraint "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_order_id_fkey";

alter table "public"."order_items" add constraint "order_items_price_positive" CHECK ((price >= (0)::numeric)) not valid;

alter table "public"."order_items" validate constraint "order_items_price_positive";

alter table "public"."order_items" add constraint "order_items_quantity_positive" CHECK ((quantity > 0)) not valid;

alter table "public"."order_items" validate constraint "order_items_quantity_positive";

alter table "public"."order_status_history" add constraint "order_status_history_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES auth.users(id) not valid;

alter table "public"."order_status_history" validate constraint "order_status_history_changed_by_fkey";

alter table "public"."orders" add constraint "orders_anonymous_cart_id_fkey" FOREIGN KEY (anonymous_cart_id) REFERENCES anonymous_carts(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED not valid;

alter table "public"."orders" validate constraint "orders_anonymous_cart_id_fkey";

alter table "public"."orders" add constraint "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_user_id_fkey";

alter table "public"."orders" add constraint "orders_user_or_anonymous_check" CHECK (((user_id IS NOT NULL) OR (anonymous_cart_id IS NOT NULL))) not valid;

alter table "public"."orders" validate constraint "orders_user_or_anonymous_check";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."reviews" add constraint "reviews_product_id_user_id_key" UNIQUE using index "reviews_product_id_user_id_key";

alter table "public"."reviews" add constraint "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5))) not valid;

alter table "public"."reviews" validate constraint "reviews_rating_check";

alter table "public"."reviews" add constraint "reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_user_id_fkey";

alter table "public"."user_journeys" add constraint "user_journeys_journey_type_check" CHECK ((journey_type = ANY (ARRAY['product_discovery'::text, 'purchase_funnel'::text, 'onboarding'::text, 'support'::text, 'content_engagement'::text]))) not valid;

alter table "public"."user_journeys" validate constraint "user_journeys_journey_type_check";

alter table "public"."user_sessions" add constraint "user_sessions_session_id_key" UNIQUE using index "user_sessions_session_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.calculate_funnel_conversion(p_journey_type text, p_start_date timestamp with time zone DEFAULT (now() - '30 days'::interval), p_end_date timestamp with time zone DEFAULT now())
 RETURNS TABLE(step text, step_order integer, users bigint, conversion_rate numeric)
 LANGUAGE plpgsql
AS $function$ BEGIN
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
 $function$
;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_ip_address inet)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ DECLARE
    request_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO request_count
    FROM public.experience_tracks
    WHERE ip_address = p_ip_address
    AND created_at > NOW() - INTERVAL '1 minute';
    
    RETURN request_count < 100; -- Max 100 requests per minute
END;
 $function$
;

CREATE OR REPLACE FUNCTION public.cleanup_expired_carts()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$ DECLARE
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
 $function$
;

CREATE OR REPLACE FUNCTION public.cleanup_old_experience_data()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$ DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.experience_tracks WHERE created_at < (NOW() - INTERVAL '90 days');
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    DELETE FROM public.user_sessions WHERE created_at < (NOW() - INTERVAL '90 days');
    DELETE FROM public.performance_metrics WHERE created_at < (NOW() - INTERVAL '30 days');
    DELETE FROM public.user_journeys WHERE created_at < (NOW() - INTERVAL '90 days');
    RETURN deleted_count;
END;
 $function$
;

CREATE OR REPLACE FUNCTION public.create_anonymous_order(p_anonymous_cart_id uuid, p_shipping_address jsonb, p_billing_address jsonb, p_payment_method text, p_status text DEFAULT 'pending'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ DECLARE
    v_order_id UUID;
    v_cart_exists BOOLEAN;
BEGIN
    -- Validate inputs
    IF p_anonymous_cart_id IS NULL OR p_shipping_address IS NULL OR p_payment_method IS NULL THEN
        RAISE EXCEPTION 'Cart ID, shipping address, and payment method are required';
    END IF;
    
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
 $function$
;

CREATE OR REPLACE FUNCTION public.get_cart_analytics()
 RETURNS TABLE(date date, active_carts integer, abandoned_carts integer, converted_carts integer, avg_cart_value numeric, avg_items_per_cart numeric)
 LANGUAGE plpgsql
AS $function$ BEGIN
    RETURN QUERY SELECT * FROM public.get_cart_analytics(
        (NOW() - INTERVAL '30 days'),
        NOW()
    );
END;
 $function$
;

CREATE OR REPLACE FUNCTION public.get_cart_analytics(p_start_date timestamp with time zone, p_end_date timestamp with time zone)
 RETURNS TABLE(date date, active_carts integer, abandoned_carts integer, converted_carts integer, avg_cart_value numeric, avg_items_per_cart numeric)
 LANGUAGE plpgsql
AS $function$ BEGIN
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
 $function$
;

CREATE OR REPLACE FUNCTION public.get_cart_by_session(p_session_id text)
 RETURNS TABLE(cart_id uuid, session_id text, status text, item_count integer, total_value numeric, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$ BEGIN
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
 $function$
;

CREATE OR REPLACE FUNCTION public.get_order_with_cart(p_order_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$ DECLARE
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
 $function$
;

CREATE OR REPLACE FUNCTION public.get_user_behavior_insights(p_start_date timestamp with time zone DEFAULT (now() - '7 days'::interval), p_end_date timestamp with time zone DEFAULT now())
 RETURNS TABLE(metric_name text, metric_value numeric, metric_unit text, comparison_period_value numeric, change_percentage numeric)
 LANGUAGE plpgsql
AS $function$ BEGIN
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
 $function$
;

CREATE OR REPLACE FUNCTION public.mark_abandoned_carts(abandonment_minutes integer DEFAULT 30)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$ DECLARE
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
 $function$
;

CREATE OR REPLACE FUNCTION public.mark_bounce_sessions()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$ DECLARE
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
 $function$
;

CREATE OR REPLACE FUNCTION public.migrate_anonymous_to_user_cart(p_session_id text, p_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$ DECLARE
    v_cart_id UUID;
    v_anonymous_cart_id UUID;
BEGIN
    -- Validate inputs
    IF p_session_id IS NULL OR p_user_id IS NULL THEN
        RAISE EXCEPTION 'Session ID and User ID are required';
    END IF;
    
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
    SELECT v_cart_id, product_id, variant_id, quantity
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
 $function$
;

CREATE OR REPLACE FUNCTION public.recover_abandoned_cart(p_session_id text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$ DECLARE
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
 $function$
;

CREATE OR REPLACE FUNCTION public.schedule_cart_cleanup_jobs()
 RETURNS void
 LANGUAGE plpgsql
AS $function$ BEGIN PERFORM cron.schedule('mark-abandoned-carts', '0 * * * *', 'SELECT public.mark_abandoned_carts(30)'); PERFORM cron.schedule('cleanup-expired-carts', '0 3 * * *', 'SELECT public.cleanup_expired_carts()'); END; $function$
;

CREATE OR REPLACE FUNCTION public.sync_order_cart_status()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ BEGIN
    IF NEW.status = 'converted' AND OLD.status != 'converted' THEN
        UPDATE public.orders
        SET status = 'processing', updated_at = NOW()
        WHERE anonymous_cart_id = NEW.id AND status = 'pending';
    END IF;
    RETURN NEW;
END;
 $function$
;

CREATE OR REPLACE FUNCTION public.trigger_update_cart_totals()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.update_cart_totals(OLD.cart_id);
        RETURN OLD;
    ELSE
        PERFORM public.update_cart_totals(NEW.cart_id);
        RETURN NEW;
    END IF;
END;
 $function$
;

CREATE OR REPLACE FUNCTION public.unschedule_cart_cleanup_jobs()
 RETURNS void
 LANGUAGE plpgsql
AS $function$ BEGIN
    PERFORM cron.unschedule('mark-abandoned-carts');
    PERFORM cron.unschedule('cleanup-expired-carts');
END;
 $function$
;

CREATE OR REPLACE FUNCTION public.update_cart_totals(p_cart_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$ BEGIN
    UPDATE public.anonymous_carts ac
    SET 
        item_count = COALESCE(totals.total_qty, 0),
        total_value = COALESCE(totals.total_val, 0),
        updated_at = NOW()
    FROM (
        SELECT 
            SUM(quantity) as total_qty,
            SUM(price * quantity) as total_val
        FROM public.anonymous_cart_items 
        WHERE cart_id = p_cart_id
    ) AS totals
    WHERE ac.id = p_cart_id;
END;
 $function$
;

CREATE OR REPLACE FUNCTION public.update_session_stats()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ BEGIN
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
 $function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
 $function$
;

create policy "Users can delete their own addresses"
on "public"."addresses"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own addresses"
on "public"."addresses"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own addresses"
on "public"."addresses"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own addresses"
on "public"."addresses"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Allow access to cart items by session"
on "public"."anonymous_cart_items"
as permissive
for all
to public
using ((cart_id IN ( SELECT anonymous_carts.id
   FROM anonymous_carts
  WHERE (anonymous_carts.session_id = current_setting('app.current_session_id'::text, true)))));


create policy "Allow service role full access to anonymous_cart_items"
on "public"."anonymous_cart_items"
as permissive
for all
to public
using ((auth.role() = 'service_role'::text));


create policy "Allow anonymous access to own cart"
on "public"."anonymous_carts"
as permissive
for all
to public
using ((auth.role() = 'anon'::text));


create policy "Allow public access with session check"
on "public"."anonymous_carts"
as permissive
for all
to public
using (true);


create policy "Allow service role full access to anonymous_carts"
on "public"."anonymous_carts"
as permissive
for all
to public
using ((auth.role() = 'service_role'::text));


create policy "Cart items are viewable by cart owner."
on "public"."cart_items"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM carts
  WHERE ((carts.id = cart_items.cart_id) AND (carts.user_id = auth.uid())))));


create policy "Users can delete cart items from their cart."
on "public"."cart_items"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM carts
  WHERE ((carts.id = cart_items.cart_id) AND (carts.user_id = auth.uid())))));


create policy "Users can insert cart items for their cart."
on "public"."cart_items"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM carts
  WHERE ((carts.id = cart_items.cart_id) AND (carts.user_id = auth.uid())))));


create policy "Users can update cart items for their cart."
on "public"."cart_items"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM carts
  WHERE ((carts.id = cart_items.cart_id) AND (carts.user_id = auth.uid())))));


create policy "Users can create their own cart."
on "public"."carts"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own cart."
on "public"."carts"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own cart."
on "public"."carts"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Allow anonymous access to experience_tracks"
on "public"."experience_tracks"
as permissive
for insert
to public
with check ((auth.role() = 'anon'::text));


create policy "Allow authenticated access to experience_tracks"
on "public"."experience_tracks"
as permissive
for all
to public
using ((auth.role() = 'authenticated'::text));


create policy "Allow service role full access to experience_tracks"
on "public"."experience_tracks"
as permissive
for all
to public
using ((auth.role() = 'service_role'::text));


create policy "Public can subscribe to newsletter"
on "public"."newsletter_subscriptions"
as permissive
for insert
to public
with check (true);


create policy "Service roles can manage subscriptions"
on "public"."newsletter_subscriptions"
as permissive
for all
to public
using ((auth.role() = 'service_role'::text));


create policy "Order items are viewable by order owner."
on "public"."order_items"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));


create policy "Users can insert order items for their orders."
on "public"."order_items"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));


create policy "Order status history is viewable by order owner"
on "public"."order_status_history"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM orders o
  WHERE ((o.id = order_status_history.order_id) AND (o.user_id = auth.uid())))));


create policy "Service role can manage order status history"
on "public"."order_status_history"
as permissive
for all
to public
using ((auth.role() = 'service_role'::text));


create policy "Allow anonymous order creation"
on "public"."orders"
as permissive
for insert
to public
with check (((anonymous_cart_id IS NOT NULL) AND (user_id IS NULL)));


create policy "Users can create orders"
on "public"."orders"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own orders"
on "public"."orders"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can view their own orders"
on "public"."orders"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Allow authenticated access to performance_metrics"
on "public"."performance_metrics"
as permissive
for all
to public
using ((auth.role() = 'authenticated'::text));


create policy "Allow service role full access to performance_metrics"
on "public"."performance_metrics"
as permissive
for all
to public
using ((auth.role() = 'service_role'::text));


create policy "Public profiles are viewable by everyone."
on "public"."profiles"
as permissive
for select
to public
using (true);


create policy "Users can insert their own profile."
on "public"."profiles"
as permissive
for insert
to public
with check ((auth.uid() = id));


create policy "Users can update their own profile."
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Reviews are public"
on "public"."reviews"
as permissive
for select
to public
using (true);


create policy "Users can delete their own reviews"
on "public"."reviews"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own reviews"
on "public"."reviews"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own reviews"
on "public"."reviews"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Allow authenticated access to user_journeys"
on "public"."user_journeys"
as permissive
for all
to public
using ((auth.role() = 'authenticated'::text));


create policy "Allow service role full access to user_journeys"
on "public"."user_journeys"
as permissive
for all
to public
using ((auth.role() = 'service_role'::text));


create policy "Allow authenticated access to user_sessions"
on "public"."user_sessions"
as permissive
for all
to public
using ((auth.role() = 'authenticated'::text));


create policy "Allow service role full access to user_sessions"
on "public"."user_sessions"
as permissive
for all
to public
using ((auth.role() = 'service_role'::text));


CREATE TRIGGER trigger_update_anonymous_cart_items_updated_at BEFORE UPDATE ON public.anonymous_cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_cart_totals_on_delete AFTER DELETE ON public.anonymous_cart_items FOR EACH ROW EXECUTE FUNCTION trigger_update_cart_totals();

CREATE TRIGGER trigger_update_cart_totals_on_insert AFTER INSERT ON public.anonymous_cart_items FOR EACH ROW EXECUTE FUNCTION trigger_update_cart_totals();

CREATE TRIGGER trigger_update_cart_totals_on_update AFTER UPDATE ON public.anonymous_cart_items FOR EACH ROW WHEN (((old.quantity IS DISTINCT FROM new.quantity) OR (old.price IS DISTINCT FROM new.price))) EXECUTE FUNCTION trigger_update_cart_totals();

CREATE TRIGGER trg_sync_order_cart_status AFTER UPDATE OF status ON public.anonymous_carts FOR EACH ROW WHEN ((old.status IS DISTINCT FROM new.status)) EXECUTE FUNCTION sync_order_cart_status();

CREATE TRIGGER trigger_update_anonymous_carts_updated_at BEFORE UPDATE ON public.anonymous_carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_session_stats AFTER INSERT ON public.experience_tracks FOR EACH ROW EXECUTE FUNCTION update_session_stats();

CREATE TRIGGER trigger_update_newsletter_subscriptions_updated_at BEFORE UPDATE ON public.newsletter_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



