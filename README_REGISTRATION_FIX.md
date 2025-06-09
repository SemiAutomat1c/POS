# Fixing "Database error saving new user" in Supabase Auth

This document provides solutions for the common "Database error saving new user" error that occurs during registration with Supabase Auth.

## Understanding the Issue

The error typically occurs due to one of two reasons:

1. **Permission issues with triggers**: When a trigger operated by the `supabase_auth_admin` role tries to interact with tables outside the `auth` schema, it may lack the necessary permissions.

2. **Constraint issues**: Restrictive foreign key constraints between the `auth.users` table and your application's tables can cause registration failures.

## Solution 1: Fix Trigger Permissions

### Step 1: Check for existing triggers

Run the following SQL in the Supabase SQL Editor:

```sql
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';
```

### Step 2: Drop problematic triggers

If you find any triggers that might be causing issues, drop them:

```sql
DROP TRIGGER IF EXISTS trigger_name ON auth.users CASCADE;
```

### Step 3: Create a new trigger with SECURITY DEFINER

Create a function with elevated permissions:

```sql
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
```

### Step 4: Create a new trigger with the security definer function

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## Solution 2: Fix Constraint Issues

### Step 1: Identify problematic constraints

```sql
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
```

### Step 2: Modify restrictive constraints

For each problematic constraint, drop it and recreate with less restrictive options:

```sql
-- Drop the constraint
ALTER TABLE table_name DROP CONSTRAINT constraint_name;

-- Recreate with less restrictive options
ALTER TABLE table_name
ADD CONSTRAINT constraint_name
FOREIGN KEY (column_name) REFERENCES referenced_table(referenced_column)
ON DELETE SET NULL; -- or another less restrictive option
```

## How to Apply These Fixes

1. Go to the Supabase Dashboard for your project
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the SQL commands from either Solution 1 or Solution 2 (or both if needed)
5. Run the query
6. Test registration again

## Additional Troubleshooting

If the issues persist after applying these solutions:

1. Check the Supabase logs for more detailed error messages
2. Verify that your database schema matches what Supabase Auth expects
3. Ensure that your application is sending the correct data during registration
4. Consider creating a new Supabase project if the issues are difficult to resolve

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/triggers.html)
- [PostgreSQL Security Definer Functions](https://www.postgresql.org/docs/current/sql-createfunction.html) 