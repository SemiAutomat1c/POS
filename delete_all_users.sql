-- IMPORTANT: This script will delete ALL users from your system
-- Only run this in development/testing environments

-- Step 1: Show counts before deletion
SELECT 'Auth Users Count Before' as description, COUNT(*) as count FROM auth.users;
SELECT 'App Users Count Before' as description, COUNT(*) as count FROM public.users;

-- Step 2: Delete all users from the public users table
-- This will cascade to any related records with foreign key constraints
DELETE FROM public.users;

-- Step 3: Delete all users from auth.users
DELETE FROM auth.users;

-- Step 4: Verify deletion
SELECT 'Auth Users Count After' as description, COUNT(*) as count FROM auth.users;
SELECT 'App Users Count After' as description, COUNT(*) as count FROM public.users; 