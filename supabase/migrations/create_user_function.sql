-- Function to manually create a user in auth.users
CREATE OR REPLACE FUNCTION create_user_manually(
  user_id UUID,
  user_email TEXT,
  user_password TEXT
) RETURNS VOID AS $$
DECLARE
  hashed_password TEXT;
BEGIN
  -- Generate a proper Supabase Auth compatible password hash
  hashed_password := crypt(user_password, gen_salt('bf'));
  
  -- Insert directly into auth.users
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    is_sso_user,
    email_change_confirm_status
  ) VALUES (
    user_id,
    user_email,
    hashed_password,
    NOW(), -- Email confirmed immediately
    NOW(),
    NOW(),
    FALSE,
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 