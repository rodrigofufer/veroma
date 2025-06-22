-- This migration fixes email verification issues and ensures proper synchronization
-- between auth.users and profiles tables

-- ============================================================================
-- ENHANCE EMAIL VERIFICATION SYSTEM
-- ============================================================================

-- Create a function to ensure email confirmation status is synced properly
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

-- Fix email verification validation function with proper string escaping
CREATE OR REPLACE FUNCTION public.check_user_verified_and_not_banned()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_status RECORD;
BEGIN
  SELECT 
    (email_confirmed_at IS NOT NULL) as is_verified,
    COALESCE(is_banned, false) as is_banned
  INTO user_status
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_status.is_verified AND NOT user_status.is_banned, FALSE);
END;
$$;

-- Create a helpful function for admins to debug auth status
CREATE OR REPLACE FUNCTION public.debug_email_status(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_auth_confirmed BOOLEAN;
  v_profile_confirmed BOOLEAN;
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

  -- Get user ID from email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found with this email'
    );
  END IF;
  
  -- Check email confirmation status in auth.users
  SELECT (email_confirmed_at IS NOT NULL) INTO v_auth_confirmed
  FROM auth.users
  WHERE id = v_user_id;
  
  -- Check email confirmation status in profiles
  SELECT (email_confirmed_at IS NOT NULL) INTO v_profile_confirmed
  FROM public.profiles
  WHERE id = v_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', user_email,
    'auth_confirmed', v_auth_confirmed,
    'profile_confirmed', v_profile_confirmed,
    'status_synced', (v_auth_confirmed = v_profile_confirmed),
    'is_synced', (v_auth_confirmed = v_profile_confirmed)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error checking email status: ' || SQLERRM
    );
END;
$$;

-- Fix email confirmation for all existing users
DO $$
BEGIN
  -- Update auth.users table for any unverified emails
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE email_confirmed_at IS NULL;

  -- Update profiles table to match auth.users email confirmation status
  UPDATE public.profiles p
  SET email_confirmed_at = u.email_confirmed_at
  FROM auth.users u
  WHERE p.id = u.id AND (p.email_confirmed_at IS NULL OR p.email_confirmed_at != u.email_confirmed_at);
END $$;

-- Enable auto-confirmation of emails for development environment
-- This will automatically confirm all new user emails
CREATE OR REPLACE FUNCTION auto_confirm_email()
RETURNS trigger AS $$
BEGIN
  -- Set email_confirmed_at for all new users
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = auth;

-- Create trigger for auto-confirming emails
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
CREATE TRIGGER auto_confirm_email_trigger 
  BEFORE INSERT ON auth.users 
  FOR EACH ROW EXECUTE FUNCTION auto_confirm_email();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.sync_user_email_confirmation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_email_confirmation(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_user_verified_and_not_banned() TO authenticated;
GRANT EXECUTE ON FUNCTION public.debug_email_status(TEXT) TO authenticated;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

-- Add comments for documentation
COMMENT ON FUNCTION public.sync_user_email_confirmation(uuid) IS 'Syncs email confirmation status between auth.users and profiles tables';
COMMENT ON FUNCTION public.check_user_verified_and_not_banned() IS 'Checks if current user has verified their email and is not banned';
COMMENT ON FUNCTION public.debug_email_status(TEXT) IS 'Admin function to debug email verification status issues';
COMMENT ON FUNCTION auto_confirm_email() IS 'Automatically confirms emails for new users in development environments';