ALTER TABLE public.orders
ADD COLUMN anonymous_cart_id UUID REFERENCES public.anonymous_carts(id) ON DELETE SET NULL;

ALTER TABLE public.orders
ALTER COLUMN user_id DROP NOT NULL;