-- Enable RLS on tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Users can view products from their store"
ON public.products
FOR SELECT
TO authenticated
USING (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can insert products into their store"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can update products in their store"
ON public.products
FOR UPDATE
TO authenticated
USING (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
))
WITH CHECK (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can delete products from their store"
ON public.products
FOR DELETE
TO authenticated
USING (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
));

-- Customers policies
CREATE POLICY "Users can view customers from their store"
ON public.customers
FOR SELECT
TO authenticated
USING (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can insert customers into their store"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can update customers in their store"
ON public.customers
FOR UPDATE
TO authenticated
USING (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
))
WITH CHECK (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can delete customers from their store"
ON public.customers
FOR DELETE
TO authenticated
USING (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
));

-- Sales policies
CREATE POLICY "Users can view sales from their store"
ON public.sales
FOR SELECT
TO authenticated
USING (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can insert sales into their store"
ON public.sales
FOR INSERT
TO authenticated
WITH CHECK (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can update sales in their store"
ON public.sales
FOR UPDATE
TO authenticated
USING (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
))
WITH CHECK (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can delete sales from their store"
ON public.sales
FOR DELETE
TO authenticated
USING (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
));

-- Returns policies
CREATE POLICY "Users can view returns from their store"
ON public.returns
FOR SELECT
TO authenticated
USING (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can insert returns into their store"
ON public.returns
FOR INSERT
TO authenticated
WITH CHECK (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can update returns in their store"
ON public.returns
FOR UPDATE
TO authenticated
USING (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
))
WITH CHECK (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can delete returns from their store"
ON public.returns
FOR DELETE
TO authenticated
USING (store_id IN (
  SELECT store_id FROM public.users WHERE id = auth.uid()
)); 