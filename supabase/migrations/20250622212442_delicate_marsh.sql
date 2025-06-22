-- For development environments, we want to auto-confirm emails
-- Note: This should be commented out in production

-- Check if we're in development mode (you can add environment checks here)
-- For now, we'll enable it by default for easier development

-- Function to auto-confirm emails
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

COMMENT ON FUNCTION auto_confirm_email() IS 'Automatically confirms emails for new users (for development only)';

-- Verify existing users' emails
DO $$
BEGIN
  -- Update auth.users table
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE email_confirmed_at IS NULL;

  -- Update profiles table
  UPDATE public.profiles p
  SET email_confirmed_at = u.email_confirmed_at
  FROM auth.users u
  WHERE p.id = u.id AND p.email_confirmed_at IS NULL AND u.email_confirmed_at IS NOT NULL;
END $$;