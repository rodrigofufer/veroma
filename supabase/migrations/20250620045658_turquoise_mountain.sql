/*
  # Add user roles and moderation features

  1. New Columns for profiles table
    - `role` (text) - User role with check constraint for 'user', 'representative', 'administrator', 'authority'
    - `strikes` (integer) - Number of strikes for moderation, default 0
    - `is_banned` (boolean) - Ban status, default false

  2. New Columns for ideas table
    - `is_official_proposal` (boolean) - Mark official proposals, default false
    - `voting_ends_at` (timestamptz) - When voting period ends for the idea

  3. Security
    - Maintains existing RLS policies
    - Adds check constraints for data integrity
*/

-- Add role column to profiles table
ALTER TABLE public.profiles
ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
CHECK (role IN ('user', 'representative', 'administrator', 'authority'));

-- Add moderation columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN strikes INTEGER NOT NULL DEFAULT 0,
ADD COLUMN is_banned BOOLEAN NOT NULL DEFAULT FALSE;

-- Add official proposal and voting deadline columns to ideas table
ALTER TABLE public.ideas
ADD COLUMN is_official_proposal BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN voting_ends_at TIMESTAMPTZ;

-- Add indexes for better performance on new columns
CREATE INDEX idx_profiles_role ON public.profiles (role);
CREATE INDEX idx_profiles_is_banned ON public.profiles (is_banned);
CREATE INDEX idx_ideas_is_official ON public.ideas (is_official_proposal);
CREATE INDEX idx_ideas_voting_ends ON public.ideas (voting_ends_at);

-- Add comments to document the new columns
COMMENT ON COLUMN public.profiles.role IS 'User role: user, representative, administrator, or authority';
COMMENT ON COLUMN public.profiles.strikes IS 'Number of moderation strikes against the user';
COMMENT ON COLUMN public.profiles.is_banned IS 'Whether the user is currently banned';
COMMENT ON COLUMN public.ideas.is_official_proposal IS 'Whether this is an official proposal from authorities';
COMMENT ON COLUMN public.ideas.voting_ends_at IS 'When the voting period ends for this idea';

-- Update the handle_new_user function to include the new role column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    lastname,
    country,
    role,
    strikes,
    is_banned,
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
    'user',
    0,
    FALSE,
    10,
    date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week')),
    10
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to check if user is banned before allowing actions
CREATE OR REPLACE FUNCTION public.check_user_not_banned()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_banned BOOLEAN;
BEGIN
  SELECT is_banned INTO user_banned
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(NOT user_banned, TRUE);
END;
$$;

-- Update RLS policies to check ban status for write operations
DROP POLICY IF EXISTS "Users can insert their own ideas" ON public.ideas;
CREATE POLICY "Users can insert their own ideas"
  ON public.ideas FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    public.check_user_not_banned()
  );

DROP POLICY IF EXISTS "Users can vote once per idea" ON public.votes;
CREATE POLICY "Users can vote once per idea"
  ON public.votes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    public.check_user_not_banned()
  );

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_user_not_banned() TO authenticated;