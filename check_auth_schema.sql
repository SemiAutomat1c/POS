-- Check if auth schema exists
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'auth';

-- Check if auth.users table exists
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'auth' AND table_name = 'users';

-- Check auth.users table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position; 