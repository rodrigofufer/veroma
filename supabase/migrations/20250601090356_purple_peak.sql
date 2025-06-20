-- Add email_confirmed_at column to profiles if not exists
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_confirmed_at timestamp with time zone;

-- Update profiles table to sync with auth.users email_confirmed_at
CREATE OR REPLACE FUNCTION public.sync_email_confirmation()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET email_confirmed_at = NEW.email_confirmed_at
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync email confirmation status
DROP TRIGGER IF EXISTS sync_email_confirmation ON auth.users;
CREATE TRIGGER sync_email_confirmation
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_email_confirmation();

-- Update existing profiles with email confirmation status
UPDATE public.profiles p
SET email_confirmed_at = u.email_confirmed_at
FROM auth.users u
WHERE p.id = u.id;