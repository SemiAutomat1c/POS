-- Function to delete a user by email
CREATE OR REPLACE FUNCTION delete_user_by_email(email_to_delete TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Run with the privileges of the function creator
SET search_path = public
AS $$
DECLARE
  user_id UUID;
  store_id UUID;
BEGIN
  -- Find the user in auth.users
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = email_to_delete;
  
  -- If user found in auth.users
  IF user_id IS NOT NULL THEN
    -- Find the store_id from public.users if it exists
    SELECT store_id INTO store_id
    FROM public.users
    WHERE email = email_to_delete;
    
    -- Delete from public.users if exists
    DELETE FROM public.users WHERE email = email_to_delete;
    
    -- Delete the store if exists
    IF store_id IS NOT NULL THEN
      DELETE FROM public.stores WHERE id = store_id;
    END IF;
    
    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = user_id;
    
    RETURN TRUE;
  ELSE
    -- User not found
    RETURN FALSE;
  END IF;
END;
$$;

-- Grant execution permission to service_role
GRANT EXECUTE ON FUNCTION delete_user_by_email TO service_role; 