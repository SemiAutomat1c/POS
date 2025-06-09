-- Drop foreign key constraints first
ALTER TABLE IF EXISTS public.stores DROP CONSTRAINT IF EXISTS fk_stores_owner;
ALTER TABLE IF EXISTS public.stores DROP CONSTRAINT IF EXISTS stores_owner_id_fkey;

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS public.return_items;
DROP TABLE IF EXISTS public.returns;
DROP TABLE IF EXISTS public.sale_items;
DROP TABLE IF EXISTS public.sales;
DROP TABLE IF EXISTS public.customers;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.subscriptions;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.stores;

-- Drop enum types
DROP TYPE IF EXISTS return_status;
DROP TYPE IF EXISTS sale_status;
DROP TYPE IF EXISTS payment_method;
DROP TYPE IF EXISTS product_condition;
DROP TYPE IF EXISTS subscription_status;
DROP TYPE IF EXISTS subscription_tier;
DROP TYPE IF EXISTS user_role; 