-- IMPORTANT: This script will delete ALL users from your system
-- Only run this in development/testing environments
-- Make sure you have backups before proceeding

-- Step 1: Show counts before deletion (for verification)
SELECT 'Auth Users Count Before' as description, COUNT(*) as count FROM auth.users;
SELECT 'App Users Count Before' as description, COUNT(*) as count FROM public.users;
SELECT 'Stores Count Before' as description, COUNT(*) as count FROM public.stores;

-- Step 2: Delete all related records in public schema tables
-- First, delete any tables with foreign key dependencies
DELETE FROM public.subscriptions;
DELETE FROM public.categories;
DELETE FROM public.products;
DELETE FROM public.customers;
DELETE FROM public.sale_items;
DELETE FROM public.sales;
DELETE FROM public.return_items;
DELETE FROM public.returns;

-- Step 3: Delete all users from the public users table
DELETE FROM public.users;

-- Step 4: Delete all stores
DELETE FROM public.stores;

-- Step 5: Delete all users from auth.users
DELETE FROM auth.users;

-- Step 6: Verify deletion
SELECT 'Auth Users Count After' as description, COUNT(*) as count FROM auth.users;
SELECT 'App Users Count After' as description, COUNT(*) as count FROM public.users;
SELECT 'Stores Count After' as description, COUNT(*) as count FROM public.stores;

-- Step 7: Reset any sequences if needed
-- For example, if you have sequences for IDs:
-- ALTER SEQUENCE public.users_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.stores_id_seq RESTART WITH 1; 