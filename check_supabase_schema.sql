-- Check if 'user_role' enum type exists
SELECT 
    n.nspname as "Schema",
    t.typname as "Name",
    t.typtype as "Type"
FROM pg_type t 
   LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
WHERE t.typname = 'user_role';

-- Check enum values if it exists
SELECT 
    e.enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'user_role';

-- Check users table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' AND 
    table_name = 'users'
ORDER BY 
    ordinal_position;

-- Check for triggers on auth.users table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM 
    information_schema.triggers
WHERE 
    event_object_schema = 'auth' AND 
    event_object_table = 'users';

-- Check for foreign key constraints related to auth.users
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

-- Check user_role references in the users table
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' AND 
    table_name = 'users' AND
    column_name = 'role';

-- Check if there are any security definer functions
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    p.prosecdef as security_definer
FROM 
    pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE 
    p.prosecdef = true; 