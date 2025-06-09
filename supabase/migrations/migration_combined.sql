-- COMBINED MIGRATION SCRIPT FOR NEW SUPABASE PROJECT
-- Run this script in the SQL Editor of your new Supabase project

-- Create enum types with IF NOT EXISTS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('owner', 'admin', 'staff');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
        CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'premium', 'enterprise');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'trial', 'cancelled');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_condition') THEN
        CREATE TYPE product_condition AS ENUM ('new', 'pre-owned', 'refurbished');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM ('cash', 'card', 'transfer');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sale_status') THEN
        CREATE TYPE sale_status AS ENUM ('completed', 'pending', 'cancelled');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'return_status') THEN
        CREATE TYPE return_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
    END IF;
END$$;

-- Create stores table
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    subscription_status subscription_status NOT NULL DEFAULT 'trial',
    max_users INTEGER NOT NULL DEFAULT 1,
    max_products INTEGER NOT NULL DEFAULT 100,
    max_locations INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'staff',
    store_id UUID REFERENCES public.stores(id),
    subscription_tier subscription_tier NOT NULL DEFAULT 'free',
    subscription_status subscription_status NOT NULL DEFAULT 'trial',
    stripe_customer_id TEXT,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    store_id UUID REFERENCES public.stores(id),
    tier subscription_tier NOT NULL,
    status subscription_status NOT NULL,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    store_id UUID REFERENCES public.stores(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    serial_number TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    min_stock_level INTEGER NOT NULL DEFAULT 0,
    category_id UUID REFERENCES public.categories(id),
    brand TEXT,
    model TEXT,
    color TEXT,
    storage TEXT,
    condition product_condition NOT NULL DEFAULT 'new',
    store_id UUID NOT NULL REFERENCES public.stores(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    store_id UUID NOT NULL REFERENCES public.stores(id),
    total_purchases INTEGER NOT NULL DEFAULT 0,
    last_purchase_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sales table
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id),
    store_id UUID NOT NULL REFERENCES public.stores(id),
    user_id UUID NOT NULL REFERENCES public.users(id),
    total DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method payment_method NOT NULL,
    status sale_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create returns table
CREATE TABLE IF NOT EXISTS public.returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id),
    customer_id UUID REFERENCES public.customers(id),
    store_id UUID NOT NULL REFERENCES public.stores(id),
    user_id UUID NOT NULL REFERENCES public.users(id),
    total DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    status return_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create return_items table
CREATE TABLE IF NOT EXISTS public.return_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID NOT NULL REFERENCES public.returns(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add IF NOT EXISTS to all triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_stores_updated_at') THEN
        CREATE TRIGGER update_stores_updated_at
        BEFORE UPDATE ON stores
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
        CREATE TRIGGER update_subscriptions_updated_at
        BEFORE UPDATE ON subscriptions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
        CREATE TRIGGER update_categories_updated_at
        BEFORE UPDATE ON categories
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
        CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customers_updated_at') THEN
        CREATE TRIGGER update_customers_updated_at
        BEFORE UPDATE ON customers
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sales_updated_at') THEN
        CREATE TRIGGER update_sales_updated_at
        BEFORE UPDATE ON sales
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sale_items_updated_at') THEN
        CREATE TRIGGER update_sale_items_updated_at
        BEFORE UPDATE ON sale_items
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_returns_updated_at') THEN
        CREATE TRIGGER update_returns_updated_at
        BEFORE UPDATE ON returns
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_return_items_updated_at') THEN
        CREATE TRIGGER update_return_items_updated_at
        BEFORE UPDATE ON return_items
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (
    id,
    username,
    email,
    hashed_password,
    role,
    subscription_tier,
    subscription_status
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    NEW.email,
    '******', -- Password stored in auth.users
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff'),
    'free',
    'trial'
  );
  
  RETURN NEW;
END;
$$;

-- Create the trigger for auth user creation with IF NOT EXISTS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END$$;

-- Enable RLS on tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- Products policies - Drop and recreate to avoid duplicates
DROP POLICY IF EXISTS "Users can view products from their store" ON public.products;
DROP POLICY IF EXISTS "Users can insert products into their store" ON public.products;
DROP POLICY IF EXISTS "Users can update products in their store" ON public.products;
DROP POLICY IF EXISTS "Users can delete products from their store" ON public.products;

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

-- Customers policies - Drop and recreate to avoid duplicates
DROP POLICY IF EXISTS "Users can view customers from their store" ON public.customers;
DROP POLICY IF EXISTS "Users can insert customers into their store" ON public.customers;
DROP POLICY IF EXISTS "Users can update customers in their store" ON public.customers;
DROP POLICY IF EXISTS "Users can delete customers from their store" ON public.customers;

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

-- Sales policies - Drop and recreate to avoid duplicates
DROP POLICY IF EXISTS "Users can view sales from their store" ON public.sales;
DROP POLICY IF EXISTS "Users can insert sales into their store" ON public.sales;
DROP POLICY IF EXISTS "Users can update sales in their store" ON public.sales;
DROP POLICY IF EXISTS "Users can delete sales from their store" ON public.sales;

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

-- Returns policies - Drop and recreate to avoid duplicates
DROP POLICY IF EXISTS "Users can view returns from their store" ON public.returns;
DROP POLICY IF EXISTS "Users can insert returns into their store" ON public.returns;
DROP POLICY IF EXISTS "Users can update returns in their store" ON public.returns;
DROP POLICY IF EXISTS "Users can delete returns from their store" ON public.returns;

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