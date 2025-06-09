-- Create user_role enum type in public schema
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('authenticated', 'service_role');
    END IF;
END $$;

-- Create user_role enum type in auth schema
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type JOIN pg_namespace ON pg_type.typnamespace = pg_namespace.oid WHERE typname = 'user_role' AND nspname = 'auth') THEN
        CREATE TYPE auth.user_role AS ENUM ('authenticated', 'service_role');
    END IF;
END $$;

-- Verify they were created
SELECT n.nspname as schema, t.typname, t.typtype 
FROM pg_type t 
JOIN pg_namespace n ON t.typnamespace = n.oid 
WHERE t.typname = 'user_role'; 