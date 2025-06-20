-- Disable email verification requirements
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    lastname,
    country,
    votes_remaining,
    votes_reset_at,
    weekly_vote_limit
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Anonymous User'),
    NEW.raw_user_meta_data->>'lastname',
    COALESCE(NEW.raw_user_meta_data->>'country', 'Unknown'),
    10,
    date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week')),
    10
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop email confirmation related columns and functions
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS email_confirmed_at;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_email_confirmation ON auth.users;
DROP FUNCTION IF EXISTS public.sync_email_confirmation();

-- Add comment documenting the change
COMMENT ON TABLE public.profiles IS 'User profiles table without email verification requirement';