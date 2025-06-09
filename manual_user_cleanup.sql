-- Replace 'your_email@example.com' with the email you want to clean up
-- Replace 'your_username' with the username you want to clean up

-- First, find the user and store IDs
WITH user_data AS (
  SELECT id, store_id, email, username
  FROM public.users
  WHERE email = 'your_email@example.com' OR username = 'your_username'
)
SELECT * FROM user_data;

-- Delete from public.users
DELETE FROM public.users
WHERE email = 'your_email@example.com' OR username = 'your_username';

-- Delete from public.stores if you know the store_id
-- Replace 'store_id_here' with the actual store ID from the first query
-- DELETE FROM public.stores WHERE id = 'store_id_here';

-- To clean up auth.users, you need admin access
-- This requires access to the Supabase dashboard > Authentication > Users
-- Find the user by email and delete them manually

-- Alternatively, if you have superuser access to the database, you can run:
-- DELETE FROM auth.users WHERE email = 'your_email@example.com';

-- Verify cleanup
SELECT * FROM public.users WHERE email = 'your_email@example.com' OR username = 'your_username';
-- This should return no rows if cleanup was successful 