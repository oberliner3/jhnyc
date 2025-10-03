DROP POLICY "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT TO public WITH CHECK (true);

DROP POLICY "Allow anonymous order creation" ON public.orders;
CREATE POLICY "Allow anonymous order creation" ON public.orders FOR INSERT TO public WITH CHECK (true);