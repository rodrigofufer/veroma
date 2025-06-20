-- ============================================================================
-- RESTORE EMAIL VERIFICATION SYSTEM (Fixed)
-- ============================================================================

-- First, add email_confirmed_at column back to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMP WITH TIME ZONE;

-- Add role, strikes, and is_banned columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role = ANY (ARRAY['user'::text, 'representative'::text, 'administrator'::text, 'authority'::text]));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS strikes INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles USING btree (role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles USING btree (is_banned);

-- Update existing profiles to have email_confirmed_at set to NOW() for existing users
-- This ensures current users don't get locked out
UPDATE public.profiles 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Create check_user_verified_and_not_banned function
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
    COALESCE(is_banned, false) as is_banned
  INTO user_status
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_status.is_verified AND NOT user_status.is_banned, FALSE);
END;
$$;

-- Create helper functions for role checking
CREATE OR REPLACE FUNCTION public.is_admin_or_authority()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role IN ('administrator', 'authority'), FALSE);
END;
$$;

CREATE OR REPLACE FUNCTION public.can_create_official_proposals()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role IN ('representative', 'administrator', 'authority'), FALSE);
END;
$$;

CREATE OR REPLACE FUNCTION public.can_modify_official_proposals()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role IN ('representative', 'administrator', 'authority'), FALSE);
END;
$$;

-- Update increment_vote function to require email verification
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
    COALESCE(is_banned, false) as is_banned
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

-- Update handle_new_user function to include all new fields
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
    NEW.email_confirmed_at  -- This will be NULL initially until email is verified
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a function to manually sync email confirmation (since we can't create triggers on auth.users)
CREATE OR REPLACE FUNCTION public.sync_user_email_confirmation(user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  auth_email_confirmed_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get email_confirmed_at from auth.users (this requires service role)
  SELECT email_confirmed_at INTO auth_email_confirmed_at
  FROM auth.users
  WHERE id = user_id;
  
  -- Update profiles table
  UPDATE public.profiles
  SET email_confirmed_at = auth_email_confirmed_at
  WHERE id = user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Update RLS policies to require email verification for write operations
DROP POLICY IF EXISTS "Users can create their own ideas" ON public.ideas;
CREATE POLICY "Users can create their own ideas"
  ON public.ideas FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    check_user_verified_and_not_banned() AND
    -- Only admins and authorities can create official proposals
    (
      NOT COALESCE(is_official_proposal, false) OR 
      can_create_official_proposals()
    )
  );

DROP POLICY IF EXISTS "Users can vote once per idea" ON public.votes;
CREATE POLICY "Users can vote once per idea"
  ON public.votes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    check_user_verified_and_not_banned()
  );

DROP POLICY IF EXISTS "Users can update their own ideas" ON public.ideas;
CREATE POLICY "Users can update their own ideas"
  ON public.ideas FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND 
    check_user_verified_and_not_banned()
  )
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own ideas" ON public.ideas;
CREATE POLICY "Users can delete their own ideas"
  ON public.ideas FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id AND 
    check_user_verified_and_not_banned()
  );

DROP POLICY IF EXISTS "Users can update their own votes" ON public.votes;
CREATE POLICY "Users can update their own votes"
  ON public.votes FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND 
    check_user_verified_and_not_banned()
  )
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own votes" ON public.votes;
CREATE POLICY "Users can delete their own votes"
  ON public.votes FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id AND 
    check_user_verified_and_not_banned()
  );

-- Update comments policies if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments' AND table_schema = 'public') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
    DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
    DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

    -- Create new policies with email verification
    EXECUTE 'CREATE POLICY "Users can create comments"
      ON public.comments FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() = user_id AND 
        check_user_verified_and_not_banned()
      )';

    EXECUTE 'CREATE POLICY "Users can update their own comments"
      ON public.comments FOR UPDATE
      TO authenticated
      USING (
        auth.uid() = user_id AND 
        check_user_verified_and_not_banned()
      )
      WITH CHECK (auth.uid() = user_id)';

    EXECUTE 'CREATE POLICY "Users can delete their own comments"
      ON public.comments FOR DELETE
      TO authenticated
      USING (
        auth.uid() = user_id AND 
        check_user_verified_and_not_banned()
      )';
  END IF;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_user_verified_and_not_banned() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_authority() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_create_official_proposals() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_modify_official_proposals() TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_vote(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_email_confirmation(uuid) TO service_role;

-- Update documentation
COMMENT ON FUNCTION public.check_user_verified_and_not_banned() IS 'Validates user has verified email and is not banned';
COMMENT ON FUNCTION public.sync_user_email_confirmation(uuid) IS 'Manually syncs email confirmation status from auth.users to profiles';
COMMENT ON COLUMN public.profiles.email_confirmed_at IS 'Timestamp when user confirmed their email address - required for platform access';
COMMENT ON COLUMN public.profiles.role IS 'User role: user, representative, administrator, or authority';
COMMENT ON COLUMN public.profiles.strikes IS 'Number of moderation strikes against the user';
COMMENT ON COLUMN public.profiles.is_banned IS 'Whether the user is currently banned';