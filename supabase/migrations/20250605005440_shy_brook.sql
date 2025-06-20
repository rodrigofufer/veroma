/*
  # Remove email verification requirements
  
  1. Changes
    - Make email_confirmed_at optional
    - Update functions to not require email verification
    - Remove verification checks from policies
*/

-- Make email_confirmed_at nullable
ALTER TABLE public.profiles
ALTER COLUMN email_confirmed_at DROP NOT NULL;

-- Update handle_new_user function to not require email verification
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

-- Drop email confirmation trigger if it exists
DROP TRIGGER IF EXISTS sync_email_confirmation ON auth.users;
DROP FUNCTION IF EXISTS public.sync_email_confirmation();

-- Update RLS policies to not check email confirmation
DROP POLICY IF EXISTS "Users can view any proposal" ON proposals;
CREATE POLICY "Users can view any proposal"
  ON proposals FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create their own proposals" ON proposals;
CREATE POLICY "Users can create their own proposals"
  ON proposals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add comment documenting the change
COMMENT ON TABLE public.profiles IS 'User profiles without email verification requirement';