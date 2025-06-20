/*
  # Fix email verification sync function

  1. Changes
    - Create a proper RPC function to sync email confirmation status
    - Ensure it's callable from client code
    - Fix permissions and security settings

  2. Security
    - Function is SECURITY DEFINER to allow access to auth schema
    - Proper search_path setting to prevent SQL injection
*/

-- Create a function to sync email confirmation status
CREATE OR REPLACE FUNCTION public.sync_user_email_confirmation(user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  auth_email_confirmed_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get email_confirmed_at from auth.users
  SELECT email_confirmed_at INTO auth_email_confirmed_at
  FROM auth.users
  WHERE id = user_id;
  
  -- Update profiles table
  UPDATE public.profiles
  SET email_confirmed_at = auth_email_confirmed_at
  WHERE id = user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.sync_user_email_confirmation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_email_confirmation(uuid) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.sync_user_email_confirmation(uuid) IS 'Syncs email confirmation status from auth.users to profiles';