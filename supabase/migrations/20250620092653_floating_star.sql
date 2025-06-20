/*
  # Fix email verification issues

  1. Changes
    - Create a more robust function to sync email confirmation status
    - Add a function to force email verification for testing
    - Add a function to check if a user's email is verified
    - Add better error handling and logging

  2. Security
    - Maintain existing RLS policies
    - Add proper error handling
    - Ensure functions have appropriate permissions
*/

-- Create a more robust function to sync email confirmation status
CREATE OR REPLACE FUNCTION public.sync_user_email_confirmation(user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  auth_email_confirmed_at TIMESTAMP WITH TIME ZONE;
  profile_exists BOOLEAN;
  auth_user_exists BOOLEAN;
  v_email TEXT;
  v_name TEXT;
  v_country TEXT;
BEGIN
  -- Check if auth user exists
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE id = user_id
  ) INTO auth_user_exists;
  
  IF NOT auth_user_exists THEN
    RAISE NOTICE 'Auth user does not exist: %', user_id;
    RETURN FALSE;
  END IF;

  -- Get user data from auth.users
  SELECT 
    email_confirmed_at, 
    email,
    COALESCE(raw_user_meta_data->>'name', 'User'),
    COALESCE(raw_user_meta_data->>'country', 'Unknown')
  INTO 
    auth_email_confirmed_at,
    v_email,
    v_name,
    v_country
  FROM auth.users
  WHERE id = user_id;
  
  -- Check if profile exists
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = user_id
  ) INTO profile_exists;
  
  IF profile_exists THEN
    -- Update existing profile
    UPDATE public.profiles
    SET 
      email_confirmed_at = auth_email_confirmed_at,
      -- Also update other fields that might be missing
      email = COALESCE(email, v_email),
      name = COALESCE(name, v_name),
      country = COALESCE(country, v_country)
    WHERE id = user_id;
    
    RAISE NOTICE 'Updated email_confirmed_at for existing profile: %', user_id;
  ELSE
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (
      id,
      email,
      name,
      lastname,
      country,
      email_confirmed_at,
      votes_remaining,
      votes_reset_at,
      weekly_vote_limit,
      role,
      strikes,
      is_banned
    )
    SELECT
      user_id,
      v_email,
      v_name,
      COALESCE(raw_user_meta_data->>'lastname', ''),
      v_country,
      auth_email_confirmed_at,
      10, -- votes_remaining
      date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week')), -- votes_reset_at
      10, -- weekly_vote_limit
      'user', -- role
      0, -- strikes
      false -- is_banned
    FROM auth.users
    WHERE id = user_id;
    
    RAISE NOTICE 'Created new profile for user: %', user_id;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in sync_user_email_confirmation: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Create a function to force email verification for testing purposes
CREATE OR REPLACE FUNCTION public.force_email_verification(user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_role text;
  target_user_exists boolean;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();
  
  IF current_user_role NOT IN ('administrator', 'authority') THEN
    RAISE EXCEPTION 'Only administrators can force email verification';
  END IF;
  
  -- Check if target user exists
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE id = user_id
  ) INTO target_user_exists;
  
  IF NOT target_user_exists THEN
    RAISE EXCEPTION 'User does not exist';
  END IF;
  
  -- Update auth.users to set email_confirmed_at
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE id = user_id;
  
  -- Update profiles table
  UPDATE public.profiles
  SET email_confirmed_at = now()
  WHERE id = user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in force_email_verification: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Create a function to check if a user's email is verified
CREATE OR REPLACE FUNCTION public.is_user_email_verified(user_id uuid DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_id uuid;
  is_verified BOOLEAN;
BEGIN
  -- Use provided user_id or current user
  target_id := COALESCE(user_id, auth.uid());
  
  IF target_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if email is confirmed in auth.users
  SELECT (email_confirmed_at IS NOT NULL) INTO is_verified
  FROM auth.users
  WHERE id = target_id;
  
  RETURN COALESCE(is_verified, FALSE);
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Create a function to clear session cache
CREATE OR REPLACE FUNCTION public.clear_session_cache(user_id uuid DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_id uuid;
BEGIN
  -- Use provided user_id or current user
  target_id := COALESCE(user_id, auth.uid());
  
  IF target_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Clear any session cache by updating the user's updated_at timestamp
  UPDATE auth.users
  SET updated_at = now()
  WHERE id = target_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.sync_user_email_confirmation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_email_confirmation(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.force_email_verification(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_email_verified(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_session_cache(uuid) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION public.sync_user_email_confirmation(uuid) IS 'Syncs email confirmation status from auth.users to profiles with improved error handling';
COMMENT ON FUNCTION public.force_email_verification(uuid) IS 'Admin-only function to force email verification for a user';
COMMENT ON FUNCTION public.is_user_email_verified(uuid) IS 'Checks if a user has verified their email address';
COMMENT ON FUNCTION public.clear_session_cache(uuid) IS 'Clears session cache by updating the user timestamp';