/*
  # Fix email verification issues
  
  1. Changes
    - Create a more robust sync_user_email_confirmation function
    - Add better error handling for email verification
    - Ensure email_confirmed_at is properly synced between auth.users and profiles
  
  2. Security
    - Maintains existing RLS policies
    - Ensures proper permissions for the function
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
BEGIN
  -- Get email_confirmed_at from auth.users
  SELECT email_confirmed_at INTO auth_email_confirmed_at
  FROM auth.users
  WHERE id = user_id;
  
  -- Check if profile exists
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = user_id
  ) INTO profile_exists;
  
  IF profile_exists THEN
    -- Update existing profile
    UPDATE public.profiles
    SET email_confirmed_at = auth_email_confirmed_at
    WHERE id = user_id;
  ELSE
    -- Create profile if it doesn't exist
    -- Get user data from auth.users
    INSERT INTO public.profiles (
      id,
      email,
      name,
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
      u.id,
      u.email,
      COALESCE(u.raw_user_meta_data->>'name', 'User'),
      COALESCE(u.raw_user_meta_data->>'country', 'Unknown'),
      u.email_confirmed_at,
      10, -- votes_remaining
      date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week')), -- votes_reset_at
      10, -- weekly_vote_limit
      'user', -- role
      0, -- strikes
      false -- is_banned
    FROM auth.users u
    WHERE u.id = user_id;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in sync_user_email_confirmation: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.sync_user_email_confirmation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_email_confirmation(uuid) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.sync_user_email_confirmation(uuid) IS 'Syncs email confirmation status from auth.users to profiles with improved error handling';

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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_user_email_verified(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_email_verified(uuid) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.is_user_email_verified(uuid) IS 'Checks if a user has verified their email address';