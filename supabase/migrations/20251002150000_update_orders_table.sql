-- Migration to update orders table to support anonymous orders
-- This adds anonymous_cart_id and makes user_id nullable
-- Add anonymous_cart_id column with foreign key to anonymous_carts
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS anonymous_cart_id UUID REFERENCES public.anonymous_carts(id) ON DELETE
SET NULL DEFERRABLE INITIALLY DEFERRED;
-- Make user_id nullable to support guest checkouts
ALTER TABLE public.orders
ALTER COLUMN user_id DROP NOT NULL;
-- Add check constraint to ensure either user_id or anonymous_cart_id is provided
ALTER TABLE public.orders
ADD CONSTRAINT orders_user_or_anonymous_check CHECK (
    (user_id IS NOT NULL)
    OR (anonymous_cart_id IS NOT NULL)
  );
-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_anonymous_cart_id ON public.orders(anonymous_cart_id)
WHERE anonymous_cart_id IS NOT NULL;
-- Add comments for documentation
COMMENT ON COLUMN public.orders.anonymous_cart_id IS 'Reference to the anonymous cart for guest checkouts';
COMMENT ON CONSTRAINT orders_user_or_anonymous_check ON public.orders IS 'Ensures that either user_id or anonymous_cart_id is provided';
-- Create a function to handle order creation for anonymous users
CREATE OR REPLACE FUNCTION public.create_anonymous_order(
    p_anonymous_cart_id UUID,
    p_shipping_address JSONB,
    p_billing_address JSONB,
    p_payment_method TEXT,
    p_status TEXT DEFAULT 'pending'
  ) RETURNS UUID AS $$
DECLARE v_order_id UUID;
v_cart_exists BOOLEAN;
BEGIN -- Verify the anonymous cart exists and is valid
SELECT EXISTS (
    SELECT 1
    FROM public.anonymous_carts
    WHERE id = p_anonymous_cart_id
      AND status = 'active'
  ) INTO v_cart_exists;
IF NOT v_cart_exists THEN RAISE EXCEPTION 'Invalid or inactive anonymous cart';
END IF;
-- Create the order
INSERT INTO public.orders (
    anonymous_cart_id,
    status,
    shipping_address,
    billing_address,
    payment_method,
    created_at,
    updated_at
  )
VALUES (
    p_anonymous_cart_id,
    p_status,
    p_shipping_address,
    p_billing_address,
    p_payment_method,
    NOW(),
    NOW()
  )
RETURNING id INTO v_order_id;
-- Mark the cart as converted
UPDATE public.anonymous_carts
SET status = 'converted',
  updated_at = NOW()
WHERE id = p_anonymous_cart_id;
RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create a function to get order details with cart information
CREATE OR REPLACE FUNCTION public.get_order_with_cart(p_order_id UUID) RETURNS JSONB AS $$
DECLARE v_result JSONB;
BEGIN
SELECT jsonb_build_object(
    'order_id',
    o.id,
    'status',
    o.status,
    'created_at',
    o.created_at,
    'updated_at',
    o.updated_at,
    'shipping_address',
    o.shipping_address,
    'billing_address',
    o.billing_address,
    'payment_method',
    o.payment_method,
    'is_guest_order',
    o.user_id IS NULL,
    'cart',
    CASE
      WHEN o.anonymous_cart_id IS NOT NULL THEN (
        SELECT jsonb_build_object(
            'cart_id',
            ac.id,
            'session_id',
            ac.session_id,
            'created_at',
            ac.created_at,
            'items',
            COALESCE(
              (
                SELECT jsonb_agg(
                    jsonb_build_object(
                      'product_id',
                      aci.product_id,
                      'variant_id',
                      aci.variant_id,
                      'product_title',
                      aci.product_title,
                      'product_image',
                      aci.product_image,
                      'price',
                      aci.price,
                      'quantity',
                      aci.quantity
                    )
                  )
                FROM public.anonymous_cart_items aci
                WHERE aci.cart_id = ac.id
              ),
              '[]'::jsonb
            )
          )
        FROM public.anonymous_carts ac
        WHERE ac.id = o.anonymous_cart_id
      )
      ELSE NULL
    END,
    'user',
    CASE
      WHEN o.user_id IS NOT NULL THEN (
        SELECT jsonb_build_object(
            'id',
            u.id,
            'email',
            u.email
          )
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
-- Add RLS policies for orders table
DO $$ BEGIN -- Allow users to view their own orders
IF NOT EXISTS (
  SELECT 1
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'orders'
    AND policyname = 'Users can view their own orders'
) THEN CREATE POLICY "Users can view their own orders" ON public.orders FOR
SELECT USING (auth.uid() = user_id);
END IF;
-- Allow users to create orders
IF NOT EXISTS (
  SELECT 1
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'orders'
    AND policyname = 'Users can create orders'
) THEN CREATE POLICY "Users can create orders" ON public.orders FOR
INSERT WITH CHECK (auth.uid() = user_id);
END IF;
-- Allow anonymous order creation (handled by the create_anonymous_order function)
IF NOT EXISTS (
  SELECT 1
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'orders'
    AND policyname = 'Allow anonymous order creation'
) THEN CREATE POLICY "Allow anonymous order creation" ON public.orders FOR
INSERT WITH CHECK (
    anonymous_cart_id IS NOT NULL
    AND user_id IS NULL
  );
END IF;
-- Allow updates to orders (with restrictions)
IF NOT EXISTS (
  SELECT 1
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'orders'
    AND policyname = 'Users can update their own orders'
) THEN CREATE POLICY "Users can update their own orders" ON public.orders FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (
    -- Only allow certain fields to be updated
    status IS NOT DISTINCT
    FROM CASE
        WHEN OLD.status = 'pending'
        AND NEW.status IN ('processing', 'cancelled') THEN NEW.status
        WHEN OLD.status = 'processing'
        AND NEW.status IN ('shipped', 'completed', 'cancelled') THEN NEW.status
        ELSE OLD.status
      END
  );
END IF;
END $$;
-- Add comments for the functions
COMMENT ON FUNCTION public.create_anonymous_order IS 'Creates an order from an anonymous cart for guest checkouts';
COMMENT ON FUNCTION public.get_order_with_cart IS 'Retrieves order details with associated cart information';
-- Create a function to sync order status with cart status
CREATE OR REPLACE FUNCTION public.sync_order_cart_status() RETURNS TRIGGER AS $$ BEGIN -- If cart is being marked as converted, ensure the order status is appropriate
  IF NEW.status = 'converted'
  AND OLD.status != 'converted' THEN
UPDATE public.orders
SET status = 'processing',
  updated_at = NOW()
WHERE anonymous_cart_id = NEW.id
  AND status = 'pending';
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create trigger to sync cart and order status
DROP TRIGGER IF EXISTS trg_sync_order_cart_status ON public.anonymous_carts;
CREATE TRIGGER trg_sync_order_cart_status
AFTER
UPDATE OF status ON public.anonymous_carts FOR EACH ROW
  WHEN (
    OLD.status IS DISTINCT
    FROM NEW.status
  ) EXECUTE FUNCTION public.sync_order_cart_status();
-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id)
WHERE user_id IS NOT NULL;