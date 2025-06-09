-- Step 1: Identify any foreign key constraints that might be causing issues
SELECT
    tc.constraint_name,
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ((ccu.table_schema = 'auth' AND ccu.table_name = 'users') 
       OR (tc.table_schema = 'auth' AND tc.table_name = 'users'));

-- Step 2: Fix any problematic constraints by modifying them to be less restrictive
-- For example, if you have a constraint that looks like:
-- ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_auth_id_fkey;

-- Step 3: Recreate the constraint with ON DELETE SET NULL or similar less restrictive option
-- Example:
-- ALTER TABLE public.users 
-- ADD CONSTRAINT users_auth_id_fkey 
-- FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 4: Check the users table structure to ensure it matches what Supabase Auth expects
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' AND 
    table_name = 'users'
ORDER BY 
    ordinal_position;

-- Step 5: Ensure the auth.users table has the expected structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'auth' AND 
    table_name = 'users'
ORDER BY 
    ordinal_position;

-- Step 6: Check for any unique constraints that might be causing conflicts
SELECT
    tc.constraint_name,
    tc.table_schema,
    tc.table_name,
    kcu.column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE' 
  AND ((tc.table_schema = 'auth' AND tc.table_name = 'users')
       OR (tc.table_schema = 'public' AND tc.table_name = 'users')); 