/*
  # Restore robust email verification system

  1. Changes
    - Add email_confirmed_at column back to profiles table
    - Update handle_new_user function to NOT set email_confirmed_at initially
    - Create email confirmation sync function
    - Add RLS policies that check email verification status
    - Create function to check email verification status

  2. Security
    - Users must verify email before accessing protected features
    - Email confirmation status is synced from auth.users
    - Banned users cannot perform actions even if verified
*/

-- Add email_confirmed_at column back to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMPTZ;

-- Update handle_new_user function to NOT set email_confirmed_at initially
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
    weekly_vote_limit,
    email_confirmed_at
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
    10,
    NEW.email_confirmed_at  -- This will be NULL initially
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to sync email confirmation status
CREATE OR REPLACE FUNCTION public.sync_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profiles table when email_confirmed_at changes in auth.users
  UPDATE public.profiles
  SET email_confirmed_at = NEW.email_confirmed_at
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to sync email confirmation status
DROP TRIGGER IF EXISTS sync_email_confirmation ON auth.users;
CREATE TRIGGER sync_email_confirmation
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_email_confirmation();

-- Create function to check if user email is verified
CREATE OR REPLACE FUNCTION public.check_user_email_verified()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_verified BOOLEAN;
BEGIN
  SELECT (email_confirmed_at IS NOT NULL) INTO user_verified
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_verified, FALSE);
END;
$$;

-- Create function to check if user is verified and not banned
CREATE OR REPLACE FUNCTION public.check_user_verified_and_not_banned()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_status RECORD;
BEGIN
  SELECT 
    (email_confirmed_at IS NOT NULL) as is_verified,
    is_banned
  INTO user_status
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_status.is_verified AND NOT user_status.is_banned, FALSE);
END;
$$;

-- Update RLS policies to require email verification for write operations
DROP POLICY IF EXISTS "Users can insert their own ideas" ON public.ideas;
CREATE POLICY "Users can insert their own ideas"
  ON public.ideas FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    public.check_user_verified_and_not_banned()
  );

DROP POLICY IF EXISTS "Users can vote once per idea" ON public.votes;
CREATE POLICY "Users can vote once per idea"
  ON public.votes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    public.check_user_verified_and_not_banned()
  );

-- Update increment_vote function to check email verification
CREATE OR REPLACE FUNCTION public.increment_vote(
  p_idea_id uuid,
  p_vote_type text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_existing_vote record;
  v_votes_remaining integer;
  v_message text;
  v_new_upvotes integer;
  v_new_downvotes integer;
  v_vote_removed boolean := false;
  v_user_verified boolean;
  v_user_banned boolean;
BEGIN
  -- Get the current user's ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;

  -- Check if user is verified and not banned
  SELECT 
    (email_confirmed_at IS NOT NULL) as is_verified,
    is_banned
  INTO v_user_verified, v_user_banned
  FROM profiles
  WHERE id = v_user_id;

  IF NOT v_user_verified THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Please verify your email address before voting',
      'error_code', 'EMAIL_NOT_VERIFIED'
    );
  END IF;

  IF v_user_banned THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Your account has been suspended',
      'error_code', 'USER_BANNED'
    );
  END IF;

  -- Check if votes need to be reset
  UPDATE profiles
  SET 
    votes_remaining = weekly_vote_limit,
    votes_reset_at = date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week'))
  WHERE 
    id = v_user_id 
    AND current_timestamp AT TIME ZONE 'UTC' >= votes_reset_at;

  -- Get user's remaining votes
  SELECT votes_remaining INTO v_votes_remaining
  FROM profiles
  WHERE id = v_user_id;

  -- Check if user has already voted on this idea
  SELECT * INTO v_existing_vote
  FROM votes v
  WHERE v.user_id = v_user_id AND v.idea_id = p_idea_id;

  -- Get current vote counts
  SELECT i.upvotes, i.downvotes INTO v_new_upvotes, v_new_downvotes
  FROM ideas i
  WHERE i.id = p_idea_id;

  IF v_existing_vote.id IS NOT NULL THEN
    -- User has already voted
    IF v_existing_vote.vote_type = p_vote_type THEN
      -- Remove the vote if clicking the same type
      DELETE FROM votes WHERE id = v_existing_vote.id;
      
      -- Update vote counts
      IF p_vote_type = 'up' THEN
        v_new_upvotes := greatest(0, v_new_upvotes - 1);
      ELSE
        v_new_downvotes := greatest(0, v_new_downvotes - 1);
      END IF;
      
      -- Return vote to user
      UPDATE profiles p
      SET votes_remaining = p.votes_remaining + 1
      WHERE p.id = v_user_id
      RETURNING p.votes_remaining INTO v_votes_remaining;
      
      v_message := 'Vote removed';
      v_vote_removed := true;
    ELSE
      -- Change vote type
      UPDATE votes v
      SET vote_type = p_vote_type
      WHERE v.id = v_existing_vote.id;
      
      -- Update vote counts
      IF p_vote_type = 'up' THEN
        v_new_upvotes := v_new_upvotes + 1;
        v_new_downvotes := greatest(0, v_new_downvotes - 1);
      ELSE
        v_new_downvotes := v_new_downvotes + 1;
        v_new_upvotes := greatest(0, v_new_upvotes - 1);
      END IF;
      
      v_message := 'Vote changed';
    END IF;
  ELSE
    -- New vote
    IF v_votes_remaining <= 0 THEN
      RETURN jsonb_build_object(
        'success', false,
        'message', 'No votes remaining this week'
      );
    END IF;
    
    -- Insert new vote
    INSERT INTO votes (user_id, idea_id, vote_type)
    VALUES (v_user_id, p_idea_id, p_vote_type);
    
    -- Update vote counts
    IF p_vote_type = 'up' THEN
      v_new_upvotes := v_new_upvotes + 1;
    ELSE
      v_new_downvotes := v_new_downvotes + 1;
    END IF;
    
    -- Decrement votes remaining
    UPDATE profiles p
    SET votes_remaining = p.votes_remaining - 1
    WHERE p.id = v_user_id
    RETURNING p.votes_remaining INTO v_votes_remaining;
    
    v_message := 'Vote recorded';
  END IF;

  -- Update idea vote counts
  UPDATE ideas i
  SET upvotes = v_new_upvotes,
      downvotes = v_new_downvotes
  WHERE i.id = p_idea_id;

  -- Return updated information
  RETURN jsonb_build_object(
    'success', true,
    'message', v_message,
    'new_upvotes', v_new_upvotes,
    'new_downvotes', v_new_downvotes,
    'new_votes_remaining_this_week', v_votes_remaining,
    'vote_removed', v_vote_removed
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', SQLERRM
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_user_email_verified() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_verified_and_not_banned() TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_vote(uuid, text) TO authenticated;

-- Add comment documenting the email verification requirement
COMMENT ON FUNCTION public.check_user_email_verified() IS 'Checks if the current user has verified their email address';
COMMENT ON FUNCTION public.check_user_verified_and_not_banned() IS 'Checks if user is verified and not banned';
COMMENT ON COLUMN public.profiles.email_confirmed_at IS 'Timestamp when user confirmed their email address';