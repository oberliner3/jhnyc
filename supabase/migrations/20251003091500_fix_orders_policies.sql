DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow anonymous order creation" ON public.orders;
CREATE POLICY "Allow anonymous order creation" ON public.orders FOR INSERT TO public WITH CHECK (anonymous_cart_id IS NOT NULL AND user_id IS NULL);