-- Step 1: Check for existing triggers on auth.users table
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- Step 2: Drop any existing triggers on auth.users
-- Uncomment and modify the trigger name after checking what exists
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Step 3: Check for any foreign key constraints referencing auth.users
SELECT
    tc.constraint_name,
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ((ccu.table_schema = 'auth' AND ccu.table_name = 'users') 
       OR (tc.table_schema = 'auth' AND tc.table_name = 'users'));

-- Step 4: Create a security definer function to handle user creation
-- This function will have elevated permissions to insert into your public tables
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into your users table
  INSERT INTO public.users (
    id,
    email,
    username,
    role,
    store_id
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'role',
    (NEW.raw_user_meta_data->>'store_id')::uuid
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error details
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW; -- Continue even if there's an error
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create the trigger with the security definer function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 6: Verify the trigger was created
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users'; 