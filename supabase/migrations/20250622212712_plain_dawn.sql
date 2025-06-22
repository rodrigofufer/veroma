-- Create a function to help fix login issues for users
CREATE OR REPLACE FUNCTION public.fix_user_login(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_auth_email_confirmed_at TIMESTAMPTZ;
  v_current_user_role TEXT;
BEGIN
  -- Check admin privileges
  SELECT role INTO v_current_user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  IF v_current_user_role NOT IN ('administrator', 'authority') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Only administrators can use this function'
    );
  END IF;

  -- Get user ID and confirmation status
  SELECT id, email_confirmed_at INTO v_user_id, v_auth_email_confirmed_at
  FROM auth.users
  WHERE email = user_email;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', format('No user with email %s exists', user_email)
    );
  END IF;

  -- First ensure email is confirmed in auth.users if not already
  IF v_auth_email_confirmed_at IS NULL THEN
    UPDATE auth.users
    SET email_confirmed_at = NOW()
    WHERE id = v_user_id;
  END IF;

  -- Then fix profile data
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    -- Update existing profile
    UPDATE public.profiles
    SET email_confirmed_at = COALESCE(v_auth_email_confirmed_at, NOW()),
        is_banned = FALSE,
        strikes = 0
    WHERE id = v_user_id;
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
      COALESCE(v_auth_email_confirmed_at, NOW())
    FROM auth.users
    WHERE id = v_user_id;
  END IF;

  -- Force session refreshes by updating user timestamp
  UPDATE auth.users
  SET updated_at = NOW()
  WHERE id = v_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', format('Login issues fixed for user %s', user_email),
    'user_id', v_user_id,
    'actions_taken', jsonb_build_array(
      'Email confirmed in auth.users',
      'Profile data synchronized',
      'User unbanned if previously banned',
      'Strikes reset to 0',
      'Sessions refreshed'
    )
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.fix_user_login(TEXT) TO authenticated;

-- Add documentation
COMMENT ON FUNCTION public.fix_user_login(TEXT) IS 'Admin function to fix login issues for a specific user by ensuring proper email verification and profile creation';