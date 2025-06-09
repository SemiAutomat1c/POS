-- Function to get a user ID by email
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Run with the privileges of the function creator
SET search_path = public
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Find the user in auth.users
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  RETURN user_id;
END;
$$;

-- Grant execution permission to service_role
GRANT EXECUTE ON FUNCTION get_user_id_by_email TO service_role; 