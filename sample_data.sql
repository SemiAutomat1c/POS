-- First, create the user
INSERT INTO public.users (
    id,
    username,
    email,
    hashed_password,
    role,
    subscription_tier,
    subscription_status
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'demo_owner',
    'demo@example.com',
    'dummy_hashed_password', -- This should be properly hashed in production
    'owner',
    'basic',
    'trial'
);

-- Then create the store
INSERT INTO public.stores (
    id,
    name,
    address,
    phone,
    email,
    owner_id,
    subscription_status,
    max_users,
    max_products,
    max_locations
) VALUES (
    'c81d4e2e-bcf2-4c1a-b7b1-9f72b904f6c2',
    'Demo Store',
    '123 Main Street',
    '555-0123',
    'demo@example.com',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'trial',
    5,
    1000,
    1
);

-- Update the user with the store_id
UPDATE public.users 
SET store_id = 'c81d4e2e-bcf2-4c1a-b7b1-9f72b904f6c2'
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Insert some sample products
INSERT INTO public.products (
    name,
    description,
    sku,
    quantity,
    price,
    cost,
    brand,
    model,
    condition,
    store_id
) VALUES 
    ('iPhone 13', 'Latest iPhone model', 'IP13-128-BLK', 10, 999.99, 750.00, 'Apple', 'A2482', 'new', 'c81d4e2e-bcf2-4c1a-b7b1-9f72b904f6c2'),
    ('Samsung Galaxy S21', 'Samsung flagship phone', 'SG21-256-GRY', 8, 899.99, 650.00, 'Samsung', 'SM-G991U', 'new', 'c81d4e2e-bcf2-4c1a-b7b1-9f72b904f6c2'),
    ('MacBook Pro', '16-inch MacBook Pro', 'MBP16-512-SPC', 5, 1999.99, 1500.00, 'Apple', 'A2485', 'new', 'c81d4e2e-bcf2-4c1a-b7b1-9f72b904f6c2');

-- Insert some sample customers
INSERT INTO public.customers (
    name,
    email,
    phone,
    address,
    store_id,
    total_purchases
) VALUES 
    ('John Doe', 'john@example.com', '555-0101', '456 Oak St', 'c81d4e2e-bcf2-4c1a-b7b1-9f72b904f6c2', 2),
    ('Jane Smith', 'jane@example.com', '555-0102', '789 Pine St', 'c81d4e2e-bcf2-4c1a-b7b1-9f72b904f6c2', 1),
    ('Bob Wilson', 'bob@example.com', '555-0103', '321 Elm St', 'c81d4e2e-bcf2-4c1a-b7b1-9f72b904f6c2', 0);

-- Insert some sample sales
INSERT INTO public.sales (
    customer_id,
    store_id,
    user_id,
    total,
    subtotal,
    tax,
    discount,
    payment_method,
    status
) 
SELECT 
    c.id as customer_id,
    'c81d4e2e-bcf2-4c1a-b7b1-9f72b904f6c2' as store_id,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' as user_id,
    1099.99 as total,
    999.99 as subtotal,
    100.00 as tax,
    0.00 as discount,
    'card' as payment_method,
    'completed' as status
FROM public.customers c
WHERE c.email = 'john@example.com'
LIMIT 1;

-- Insert a sample return
INSERT INTO public.returns (
    sale_id,
    customer_id,
    store_id,
    user_id,
    total,
    reason,
    status
)
SELECT 
    s.id as sale_id,
    s.customer_id,
    s.store_id,
    s.user_id,
    s.total,
    'Changed mind' as reason,
    'completed' as status
FROM public.sales s
LIMIT 1;

-- Create a function to handle new user signups
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
    role,
    subscription_tier,
    subscription_status
  ) VALUES (
    NEW.id,
    NEW.email, -- Using email as username initially
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'free',
    'trial'
  );
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 