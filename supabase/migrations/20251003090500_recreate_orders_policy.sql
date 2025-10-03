DROP POLICY "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));