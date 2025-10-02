-- Migration to update orders table to support anonymous carts

-- 1. Add anonymous_cart_id column with foreign key
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS anonymous_cart_id UUID REFERENCES public.anonymous_carts(id) ON DELETE SET NULL;

-- 2. Make user_id nullable to support anonymous orders
ALTER TABLE public.orders
ALTER COLUMN user_id DROP NOT NULL;

-- 3. Add check constraint to ensure at least one of user_id or anonymous_cart_id is provided
ALTER TABLE public.orders
ADD CONSTRAINT check_user_or_anonymous 
CHECK (user_id IS NOT NULL OR anonymous_cart_id IS NOT NULL);

-- 4. Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_anonymous_cart_id ON public.orders(anonymous_cart_id);

-- 5. Add comment for documentation
COMMENT ON COLUMN public.orders.anonymous_cart_id IS 'References the anonymous cart for guest checkouts';
COMMENT ON CONSTRAINT check_user_or_anonymous ON public.orders IS 'Ensures either user_id or anonymous_cart_id is provided';
