-- anon cart items
create table "public"."anonymous_cart_items" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "cart_id" uuid,
    "product_id" text not null,
    "variant_id" text,
    "product_title" text not null,
    "product_image" text,
    "price" numeric(10, 2) not null,
    "quantity" integer not null,
    "added_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);
alter table "public"."anonymous_cart_items" enable row level security;
-- anon carts
create table "public"."anonymous_carts" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "session_id" text not null,
    "expires_at" timestamp with time zone not null default (now() + '7 days'::interval),
    "email" text,
    "phone" text,
    "cart_data" jsonb default '{}'::jsonb,
    "total_value" numeric(10, 2) default 0,
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
-- cart items
create table "public"."cart_items" (
    "id" uuid not null default gen_random_uuid(),
    "cart_id" uuid,
    "product_id" uuid,
    "variant_id" uuid,
    "quantity" integer not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);
alter table "public"."cart_items" enable row level security;
-- carts
create table "public"."carts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);
alter table "public"."carts" enable row level security;
-- order items
create table "public"."order_items" (
    "id" uuid not null default gen_random_uuid(),
    "order_id" uuid,
    "product_id" uuid,
    "variant_id" uuid,
    "quantity" integer not null,
    "price" numeric(10, 2) not null
);
alter table "public"."order_items" enable row level security;
-- orders
create table "public"."orders" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "status" text not null default 'Pending'::text,
    "total" numeric(10, 2) not null,
    "shipping_address" jsonb,
    "billing_address" jsonb,
    "anonymous_cart_id" UUID REFERENCES public.anonymous_carts(id) ON DELETE
    SET NULL
);
alter table "public"."orders" enable row level security;
ALTER TABLE public.orders
ALTER COLUMN user_id DROP NOT NULL;
-- products
create table "public"."products" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "handle" text not null,
    "description" text,
    "price" numeric(10, 2) not null,
    "compare_at_price" numeric(10, 2),
    "images" jsonb not null default '[]'::jsonb,
    "category" text,
    "in_stock" boolean not null default true,
    "rating" numeric(2, 1) not null default 0.0,
    "review_count" integer not null default 0,
    "tags" text [] not null default '{}'::text [],
    "vendor" text,
    "variants" jsonb not null default '[]'::jsonb,
    "options" jsonb not null default '[]'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);
alter table "public"."products" enable row level security;
-- profiles
create table "public"."profiles" (
    "id" uuid not null,
    "full_name" text,
    "avatar_url" text,
    "billing_address" jsonb,
    "shipping_address" jsonb,
    "updated_at" timestamp with time zone default now()
);
alter table "public"."profiles" enable row level security;
-- indexes
CREATE UNIQUE INDEX anonymous_cart_items_pkey ON public.anonymous_cart_items USING btree (id);
CREATE UNIQUE INDEX anonymous_carts_pkey ON public.anonymous_carts USING btree (id);
CREATE UNIQUE INDEX anonymous_carts_session_id_key ON public.anonymous_carts USING btree (session_id);
CREATE UNIQUE INDEX cart_items_pkey ON public.cart_items USING btree (id);
CREATE UNIQUE INDEX carts_pkey ON public.carts USING btree (id);
CREATE INDEX idx_anonymous_cart_items_cart_id ON public.anonymous_cart_items USING btree (cart_id);
CREATE INDEX idx_anonymous_cart_items_product_id ON public.anonymous_cart_items USING btree (product_id);
CREATE INDEX idx_anonymous_cart_items_variant_id ON public.anonymous_cart_items USING btree (variant_id)
WHERE (variant_id IS NOT NULL);
CREATE INDEX idx_anonymous_carts_email ON public.anonymous_carts USING btree (email)
WHERE (email IS NOT NULL);
CREATE INDEX idx_anonymous_carts_expires_at ON public.anonymous_carts USING btree (expires_at);
CREATE INDEX idx_anonymous_carts_session_id ON public.anonymous_carts USING btree (session_id);
CREATE INDEX idx_anonymous_carts_status ON public.anonymous_carts USING btree (status);
CREATE INDEX idx_anonymous_carts_utm_source ON public.anonymous_carts USING btree (utm_source)
WHERE (utm_source IS NOT NULL);
CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);
CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);
CREATE UNIQUE INDEX products_handle_key ON public.products USING btree (handle);
CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id);
CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);
-- primary keys
alter table "public"."anonymous_cart_items"
add constraint "anonymous_cart_items_pkey" PRIMARY KEY using index "anonymous_cart_items_pkey";
alter table "public"."anonymous_carts"
add constraint "anonymous_carts_pkey" PRIMARY KEY using index "anonymous_carts_pkey";
alter table "public"."cart_items"
add constraint "cart_items_pkey" PRIMARY KEY using index "cart_items_pkey";
alter table "public"."carts"
add constraint "carts_pkey" PRIMARY KEY using index "carts_pkey";
alter table "public"."order_items"
add constraint "order_items_pkey" PRIMARY KEY using index "order_items_pkey";
alter table "public"."orders"
add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";
alter table "public"."products"
add constraint "products_pkey" PRIMARY KEY using index "products_pkey";
alter table "public"."profiles"
add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";
-- foreign keys
alter table "public"."anonymous_cart_items"
add constraint "anonymous_cart_items_cart_id_fkey" FOREIGN KEY (cart_id) REFERENCES anonymous_carts(id) ON DELETE CASCADE not valid;
alter table "public"."anonymous_cart_items" validate constraint "anonymous_cart_items_cart_id_fkey";
alter table "public"."anonymous_cart_items"
add constraint "anonymous_cart_items_quantity_check" CHECK ((quantity > 0)) not valid;
alter table "public"."anonymous_cart_items" validate constraint "anonymous_cart_items_quantity_check";
alter table "public"."anonymous_carts"
add constraint "anonymous_carts_session_id_key" UNIQUE using index "anonymous_carts_session_id_key";
alter table "public"."anonymous_carts"
add constraint "anonymous_carts_status_check" CHECK (
        (
            status = ANY (
                ARRAY ['active'::text, 'abandoned'::text, 'converted'::text, 'expired'::text]
            )
        )
    ) not valid;
alter table "public"."anonymous_carts" validate constraint "anonymous_carts_status_check";
alter table "public"."cart_items"
add constraint "cart_items_cart_id_fkey" FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE not valid;
alter table "public"."cart_items" validate constraint "cart_items_cart_id_fkey";
alter table "public"."cart_items"
add constraint "cart_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE not valid;
alter table "public"."cart_items" validate constraint "cart_items_product_id_fkey";
alter table "public"."carts"
add constraint "carts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;
alter table "public"."carts" validate constraint "carts_user_id_fkey";
alter table "public"."order_items"
add constraint "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE not valid;
alter table "public"."order_items" validate constraint "order_items_order_id_fkey";
alter table "public"."order_items"
add constraint "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE
SET NULL not valid;
alter table "public"."order_items" validate constraint "order_items_product_id_fkey";
alter table "public"."orders"
add constraint "orders_anonymous_cart_id_fkey" FOREIGN KEY (anonymous_cart_id) REFERENCES anonymous_carts(id) ON DELETE
SET NULL not valid;
alter table "public"."orders" validate constraint "orders_anonymous_cart_id_fkey";
alter table "public"."orders"
add constraint "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;
alter table "public"."orders" validate constraint "orders_user_id_fkey";
alter table "public"."products"
add constraint "products_handle_key" UNIQUE using index "products_handle_key";
alter table "public"."profiles"
add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;
alter table "public"."profiles" validate constraint "profiles_id_fkey";
set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.cleanup_expired_anonymous_carts() RETURNS integer LANGUAGE plpgsql AS $function$
DECLARE deleted_count INTEGER;
BEGIN -- Mark expired carts as expired first
UPDATE public.anonymous_carts
SET status = 'expired',
    updated_at = NOW()
WHERE expires_at < NOW()
    AND status IN ('active', 'abandoned');
-- Delete cart items for carts older than 30 days
DELETE FROM public.anonymous_cart_items
WHERE cart_id IN (
        SELECT id
        FROM public.anonymous_carts
        WHERE expires_at < (NOW() - INTERVAL '30 days')
    );
-- Delete carts older than 30 days
DELETE FROM public.anonymous_carts
WHERE expires_at < (NOW() - INTERVAL '30 days');
GET DIAGNOSTICS deleted_count = ROW_COUNT;
RETURN deleted_count;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_cart_analytics() RETURNS TABLE(
        total_carts bigint,
        active_carts bigint,
        abandoned_carts bigint,
        converted_carts bigint,
        avg_cart_value numeric,
        avg_items_per_cart numeric,
        conversion_rate numeric,
        abandonment_rate numeric
    ) LANGUAGE plpgsql AS $function$ BEGIN RETURN QUERY
SELECT *
FROM get_cart_analytics(
        (NOW() - INTERVAL '30 days'),
        NOW()
    );
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_cart_analytics(
        p_start_date timestamp with time zone,
        p_end_date timestamp with time zone
    ) RETURNS TABLE(
        total_carts bigint,
        active_carts bigint,
        abandoned_carts bigint,
        converted_carts bigint,
        avg_cart_value numeric,
        avg_items_per_cart numeric,
        conversion_rate numeric,
        abandonment_rate numeric
    ) LANGUAGE plpgsql AS $function$ BEGIN RETURN QUERY
SELECT COUNT(*) as total_carts,
    COUNT(*) FILTER (
        WHERE status = 'active'
    ) as active_carts,
    COUNT(*) FILTER (
        WHERE status = 'abandoned'
    ) as abandoned_carts,
    COUNT(*) FILTER (
        WHERE status = 'converted'
    ) as converted_carts,
    ROUND(AVG(total_value), 2) as avg_cart_value,
    ROUND(AVG(item_count), 2) as avg_items_per_cart,
    CASE
        WHEN COUNT(*) > 0 THEN ROUND(
            (
                COUNT(*) FILTER (
                    WHERE status = 'converted'
                )::DECIMAL / COUNT(*)
            ) * 100,
            2
        )
        ELSE 0
    END as conversion_rate,
    CASE
        WHEN COUNT(*) > 0 THEN ROUND(
            (
                COUNT(*) FILTER (
                    WHERE status = 'abandoned'
                )::DECIMAL / COUNT(*)
            ) * 100,
            2
        )
        ELSE 0
    END as abandonment_rate
FROM public.anonymous_carts
WHERE created_at BETWEEN p_start_date AND p_end_date;
END;
$function$;
CREATE OR REPLACE FUNCTION public.mark_abandoned_carts() RETURNS integer LANGUAGE plpgsql AS $function$
DECLARE updated_count INTEGER;
BEGIN -- Mark carts as abandoned if they haven't been updated in 24 hours
UPDATE public.anonymous_carts
SET status = 'abandoned',
    updated_at = NOW()
WHERE status = 'active'
    AND updated_at < (NOW() - INTERVAL '24 hours')
    AND item_count > 0;
GET DIAGNOSTICS updated_count = ROW_COUNT;
RETURN updated_count;
END;
$function$;
CREATE OR REPLACE FUNCTION public.update_cart_totals() RETURNS trigger LANGUAGE plpgsql AS $function$ BEGIN -- Update the cart totals
UPDATE public.anonymous_carts
SET total_value = (
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
$function$;
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql AS $function$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$function$;
create policy "Allow anonymous access to own cart items" on "public"."anonymous_cart_items" as permissive for all to public using ((auth.role() = 'anon'::text));
create policy "Allow service role full access to anonymous_cart_items" on "public"."anonymous_cart_items" as permissive for all to public using ((auth.role() = 'service_role'::text));
create policy "Allow anonymous access to own cart" on "public"."anonymous_carts" as permissive for all to public using ((auth.role() = 'anon'::text));
create policy "Allow service role full access to anonymous_carts" on "public"."anonymous_carts" as permissive for all to public using ((auth.role() = 'service_role'::text));
create policy "Cart items are viewable by cart owner." on "public"."cart_items" as permissive for
select to public using (
        (
            EXISTS (
                SELECT 1
                FROM carts
                WHERE (
                        (carts.id = cart_items.cart_id)
                        AND (carts.user_id = auth.uid())
                    )
            )
        )
    );
create policy "Users can delete cart items from their cart." on "public"."cart_items" as permissive for delete to public using (
    (
        EXISTS (
            SELECT 1
            FROM carts
            WHERE (
                    (carts.id = cart_items.cart_id)
                    AND (carts.user_id = auth.uid())
                )
        )
    )
);
create policy "Users can insert cart items for their cart." on "public"."cart_items" as permissive for
insert to public with check (
        (
            EXISTS (
                SELECT 1
                FROM carts
                WHERE (
                        (carts.id = cart_items.cart_id)
                        AND (carts.user_id = auth.uid())
                    )
            )
        )
    );
create policy "Users can update cart items for their cart." on "public"."cart_items" as permissive for
update to public using (
        (
            EXISTS (
                SELECT 1
                FROM carts
                WHERE (
                        (carts.id = cart_items.cart_id)
                        AND (carts.user_id = auth.uid())
                    )
            )
        )
    );
create policy "Users can create their own cart." on "public"."carts" as permissive for
insert to public with check ((auth.uid() = user_id));
create policy "Users can update their own cart." on "public"."carts" as permissive for
update to public using ((auth.uid() = user_id));
create policy "Users can view their own cart." on "public"."carts" as permissive for
select to public using ((auth.uid() = user_id));
create policy "Order items are viewable by order owner." on "public"."order_items" as permissive for
select to public using (
        (
            EXISTS (
                SELECT 1
                FROM orders
                WHERE (
                        (orders.id = order_items.order_id)
                        AND (orders.user_id = auth.uid())
                    )
            )
        )
    );
create policy "Users can insert order items for their orders." on "public"."order_items" as permissive for
insert to public with check (
        (
            EXISTS (
                SELECT 1
                FROM orders
                WHERE (
                        (orders.id = order_items.order_id)
                        AND (orders.user_id = auth.uid())
                    )
            )
        )
    );
create policy "Users can create orders." on "public"."orders" as permissive for
insert to public with check ((auth.uid() = user_id));
create policy "Users can view their own orders." on "public"."orders" as permissive for
select to public using ((auth.uid() = user_id));
create policy "Products are viewable by everyone." on "public"."products" as permissive for
select to public using (true);
create policy "Public profiles are viewable by everyone." on "public"."profiles" as permissive for
select to public using (true);
create policy "Users can insert their own profile." on "public"."profiles" as permissive for
insert to public with check ((auth.uid() = id));
create policy "Users can update their own profile." on "public"."profiles" as permissive for
update to public using ((auth.uid() = id));
CREATE TRIGGER trigger_update_anonymous_cart_items_updated_at BEFORE
UPDATE ON public.anonymous_cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_cart_totals_on_delete
AFTER DELETE ON public.anonymous_cart_items FOR EACH ROW EXECUTE FUNCTION update_cart_totals();
CREATE TRIGGER trigger_update_cart_totals_on_insert
AFTER
INSERT ON public.anonymous_cart_items FOR EACH ROW EXECUTE FUNCTION update_cart_totals();
CREATE TRIGGER trigger_update_cart_totals_on_update
AFTER
UPDATE ON public.anonymous_cart_items FOR EACH ROW EXECUTE FUNCTION update_cart_totals();
CREATE TRIGGER trigger_update_anonymous_carts_updated_at BEFORE
UPDATE ON public.anonymous_carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();