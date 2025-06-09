-- IMPORTANT: This script requires superuser privileges to run
-- You may need to run this in the Supabase dashboard SQL editor

-- Replace 'your_email@example.com' with the email address you want to clean up

-- First, check if the user exists in auth.users
SELECT id, email, created_at
FROM auth.users
WHERE email = 'your_email@example.com';

-- If the user exists, delete them directly from auth.users
DELETE FROM auth.users
WHERE email = 'your_email@example.com';

-- Also clean up any records in public.users
DELETE FROM public.users
WHERE email = 'your_email@example.com';

-- Verify the user is gone
SELECT id, email
FROM auth.users
WHERE email = 'your_email@example.com';

-- If you know the username, also clean up by username
-- DELETE FROM public.users
-- WHERE username = 'your_username';

-- If you have store records that need cleanup, you can find them with:
-- SELECT * FROM public.stores WHERE id NOT IN (SELECT store_id FROM public.users WHERE store_id IS NOT NULL);
-- And then delete orphaned stores:
-- DELETE FROM public.stores WHERE id NOT IN (SELECT store_id FROM public.users WHERE store_id IS NOT NULL); 