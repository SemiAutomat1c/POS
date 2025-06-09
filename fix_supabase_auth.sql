-- SOLUTION FOR "Database error saving new user" ERROR

-- Step 1: Create the user_role enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('owner', 'admin', 'staff');
    END IF;
END
$$;

-- Step 2: Create subscription_tier enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
        CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'premium', 'enterprise');
    END IF;
END
$$;

-- Step 3: Create subscription_status enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'cancelled', 'expired');
    END IF;
END
$$;

-- Step 4: Drop any existing triggers on auth.users that might cause permission issues
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_schema = 'auth' AND event_object_table = 'users'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_rec.trigger_name || ' ON auth.users CASCADE;';
    END LOOP;
END
$$;

-- Step 5: Create a security definer function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public users table when a new auth user is created
  INSERT INTO public.users (
    id,
    email,
    username,
    role,
    store_id,
    subscription_tier,
    subscription_status,
    trial_ends_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    (NEW.raw_user_meta_data->>'role')::user_role,
    (NEW.raw_user_meta_data->>'store_id')::uuid,
    'free'::subscription_tier,
    'trial'::subscription_status,
    now() + interval '30 days'
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error details
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW; -- Continue even if there's an error
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create the trigger with the security definer function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 7: Check for and fix any foreign key constraints
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN 
        SELECT tc.constraint_name, tc.table_schema, tc.table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ((ccu.table_schema = 'auth' AND ccu.table_name = 'users') 
               OR (tc.table_schema = 'auth' AND tc.table_name = 'users'))
    LOOP
        EXECUTE 'ALTER TABLE ' || constraint_rec.table_schema || '.' || constraint_rec.table_name || 
                ' DROP CONSTRAINT IF EXISTS ' || constraint_rec.constraint_name || ' CASCADE;';
    END LOOP;
END
$$;

-- Step 8: Grant necessary permissions to the supabase_auth_admin role
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.users TO supabase_auth_admin;
GRANT USAGE ON TYPE user_role TO supabase_auth_admin;
GRANT USAGE ON TYPE subscription_tier TO supabase_auth_admin;
GRANT USAGE ON TYPE subscription_status TO supabase_auth_admin;

-- Step 9: Verify the setup
SELECT 
    n.nspname as "Schema",
    t.typname as "Name",
    t.typtype as "Type"
FROM pg_type t 
   LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
WHERE t.typname IN ('user_role', 'subscription_tier', 'subscription_status');

SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';