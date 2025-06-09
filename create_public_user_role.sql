-- Create user_role enum type in public schema only
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('authenticated', 'service_role');
    END IF;
END $$;

-- Verify it was created
SELECT n.nspname as schema, t.typname, t.typtype 
FROM pg_type t 
JOIN pg_namespace n ON t.typnamespace = n.oid 
WHERE t.typname = 'user_role'; 