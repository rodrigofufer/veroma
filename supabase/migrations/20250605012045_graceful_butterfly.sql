-- Remove email verification requirements
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email_confirmed_at CASCADE;

-- Drop email confirmation triggers and functions
DROP TRIGGER IF EXISTS sync_email_confirmation ON auth.users;
DROP FUNCTION IF EXISTS public.sync_email_confirmation();

-- Update handle_new_user function
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

-- Update RLS policies
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

-- Add documentation
COMMENT ON TABLE public.profiles IS 'User profiles table without email verification requirement';