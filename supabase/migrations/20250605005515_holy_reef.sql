-- Create a function to handle email verification settings
CREATE OR REPLACE FUNCTION handle_email_verification()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update user management settings to disable email verification
  PERFORM set_config('auth.email_confirm_required', 'false', false);
  
  -- Mark all existing users as verified
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('email_verified', true)
      ELSE 
        raw_user_meta_data || jsonb_build_object('email_verified', true)
    END,
    updated_at = NOW();
END;
$$;

-- Execute the function
SELECT handle_email_verification();

-- Drop the function after use
DROP FUNCTION handle_email_verification();

-- Update profiles table to match
UPDATE public.profiles
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;