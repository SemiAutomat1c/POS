-- Create user_role enum type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('authenticated', 'service_role');
    END IF;
END $$;

-- Verify it was created
SELECT typname, typtype FROM pg_type WHERE typname = 'user_role'; 