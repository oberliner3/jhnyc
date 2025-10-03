DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anonymous order creation" ON public.orders;
CREATE POLICY "Allow authenticated users to create orders" ON public.orders FOR INSERT TO public WITH CHECK (auth.uid() = user_id);