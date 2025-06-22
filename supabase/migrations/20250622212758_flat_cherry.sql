-- This migration enables auto-confirmation of emails for development environments
-- and provides a way to verify all existing emails.

-- Ensure the auto_confirm_email function exists with proper implementation
CREATE OR REPLACE FUNCTION auto_confirm_email()
RETURNS trigger AS $$
BEGIN
  -- Set email_confirmed_at for all new users
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = auth;

-- Create or replace the trigger for auto-confirming emails
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
CREATE TRIGGER auto_confirm_email_trigger 
  BEFORE INSERT ON auth.users 
  FOR EACH ROW EXECUTE FUNCTION auto_confirm_email();

-- Create a function to verify all existing emails (useful for development/testing)
CREATE OR REPLACE FUNCTION public.verify_all_emails()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  updated_users INTEGER;
  updated_profiles INTEGER;
BEGIN
  -- Update auth.users
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE email_confirmed_at IS NULL;
  
  GET DIAGNOSTICS updated_users = ROW_COUNT;
  
  -- Update profiles
  UPDATE public.profiles p
  SET email_confirmed_at = u.email_confirmed_at
  FROM auth.users u
  WHERE p.id = u.id 
    AND (p.email_confirmed_at IS NULL OR p.email_confirmed_at IS DISTINCT FROM u.email_confirmed_at);
  
  GET DIAGNOSTICS updated_profiles = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Email verification completed',
    'users_updated', updated_users,
    'profiles_updated', updated_profiles
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error verifying emails: ' || SQLERRM
    );
END;
$$;

-- Verify all existing emails to ensure development setup works smoothly
SELECT public.verify_all_emails();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.verify_all_emails() TO service_role;
GRANT EXECUTE ON FUNCTION auto_confirm_email() TO service_role;

-- Add documentation
COMMENT ON FUNCTION auto_confirm_email() IS 'Automatically confirms emails for new users (for development only)';
COMMENT ON FUNCTION public.verify_all_emails() IS 'Verifies all emails in the database (for development/testing)';