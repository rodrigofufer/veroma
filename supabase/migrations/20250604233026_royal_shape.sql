/*
  # Add lastname field and update profile handling

  1. Changes
    - Add lastname column to profiles table
    - Update handle_new_user function to handle lastname
    - Recreate trigger with updated function

  2. Security
    - Maintains existing RLS policies
    - No changes to table permissions
*/

-- Add lastname column to profiles table if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS lastname TEXT;

-- Update the handle_new_user function to include lastname
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    lastname,
    country,
    email_confirmed_at,
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
    NEW.email_confirmed_at,
    10,
    date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week')),
    10
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();