-- Create a function to debug auth status for administrators
CREATE OR REPLACE FUNCTION public.debug_auth_status(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_record RECORD;
  profile_record RECORD;
  result JSONB;
BEGIN
  -- Check admin privileges
  IF NOT (SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('administrator', 'authority')
  )) THEN
    RETURN jsonb_build_object(
      'error', 'Not authorized',
      'message', 'Only administrators can use this function'
    );
  END IF;

  -- Get auth user info
  SELECT * INTO user_record
  FROM auth.users
  WHERE email = user_email;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'error', 'User not found',
      'message', format('No user with email %s exists in auth.users', user_email)
    );
  END IF;

  -- Get profile info
  SELECT * INTO profile_record
  FROM public.profiles
  WHERE id = user_record.id;

  -- Build result
  result := jsonb_build_object(
    'user_id', user_record.id,
    'email', user_record.email,
    'email_confirmed_at', user_record.email_confirmed_at,
    'created_at', user_record.created_at,
    'updated_at', user_record.updated_at,
    'last_sign_in_at', user_record.last_sign_in_at,
    'profile_exists', profile_record.id IS NOT NULL
  );

  -- Add profile info if exists
  IF profile_record.id IS NOT NULL THEN
    result := result || jsonb_build_object(
      'profile', jsonb_build_object(
        'name', profile_record.name,
        'email', profile_record.email,
        'country', profile_record.country,
        'role', profile_record.role,
        'is_banned', profile_record.is_banned,
        'email_confirmed_at', profile_record.email_confirmed_at
      )
    );
  END IF;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'message', 'An error occurred while debugging auth status'
    );
END;
$$;

-- Create a function to fix a user's login issues
CREATE OR REPLACE FUNCTION public.fix_user_login(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_id UUID;
  auth_email_confirmed_at TIMESTAMPTZ;
BEGIN
  -- Check admin privileges
  IF NOT (SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('administrator', 'authority')
  )) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Only administrators can use this function'
    );
  END IF;

  -- Get user ID and confirmation status
  SELECT id, email_confirmed_at INTO user_id, auth_email_confirmed_at
  FROM auth.users
  WHERE email = user_email;

  IF user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', format('No user with email %s exists', user_email)
    );
  END IF;

  -- First ensure email is confirmed in auth.users if not already
  IF auth_email_confirmed_at IS NULL THEN
    UPDATE auth.users
    SET email_confirmed_at = NOW()
    WHERE id = user_id;
  END IF;

  -- Then fix profile data
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    -- Update existing profile
    UPDATE public.profiles
    SET email_confirmed_at = COALESCE(auth_email_confirmed_at, NOW()),
        is_banned = FALSE,
        strikes = 0
    WHERE id = user_id;
  ELSE
    -- Create missing profile
    INSERT INTO public.profiles (
      id,
      email,
      name,
      country,
      role,
      strikes, 
      is_banned,
      votes_remaining,
      votes_reset_at,
      weekly_vote_limit,
      email_confirmed_at
    )
    SELECT
      id,
      email,
      COALESCE(raw_user_meta_data->>'name', 'User'),
      COALESCE(raw_user_meta_data->>'country', 'Unknown'),
      'user',
      0,
      FALSE,
      10,
      date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week')),
      10,
      COALESCE(email_confirmed_at, NOW())
    FROM auth.users
    WHERE id = user_id;
  END IF;

  -- Force session refreshes by updating user timestamp
  UPDATE auth.users
  SET updated_at = NOW()
  WHERE id = user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', format('Login issues fixed for user %s', user_email),
    'user_id', user_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'An error occurred while fixing user login'
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION debug_auth_status(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION fix_user_login(TEXT) TO authenticated;

-- Add documentation
COMMENT ON FUNCTION debug_auth_status(TEXT) IS 'Admin function to debug authentication status for a user';
COMMENT ON FUNCTION fix_user_login(TEXT) IS 'Admin function to fix login issues for a specific user';

-- Add a function to automatically verify all emails in development
CREATE OR REPLACE FUNCTION verify_all_emails()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Check admin privileges
  IF NOT (SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('administrator', 'authority')
  )) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Only administrators can use this function'
    );
  END IF;

  -- Update auth.users table
  WITH updated AS (
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email_confirmed_at IS NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO updated_count FROM updated;

  -- Update profiles table
  UPDATE public.profiles p
  SET email_confirmed_at = u.email_confirmed_at
  FROM auth.users u
  WHERE p.id = u.id AND p.email_confirmed_at IS NULL AND u.email_confirmed_at IS NOT NULL;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Email verification process completed',
    'verified_count', updated_count
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'An error occurred during verification process'
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION verify_all_emails() TO authenticated;

-- Add documentation
COMMENT ON FUNCTION verify_all_emails() IS 'Admin function to verify all unverified emails (for development environments)';