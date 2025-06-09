-- Check if auth schema exists
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'auth';

-- Check if auth.users table exists
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'auth' AND table_name = 'users';

-- Check for permissions
SELECT grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'auth' AND table_name = 'users';

-- Check for other tables in auth schema that might be accessible
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'auth'; 