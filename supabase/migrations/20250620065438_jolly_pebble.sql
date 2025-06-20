-- Disable email verification requirements temporarily for development
-- This migration removes email verification checks to allow immediate access

-- Update check_user_verified_and_not_banned function to not require email verification
CREATE OR REPLACE FUNCTION public.check_user_verified_and_not_banned()
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
  
  -- Return false if user is banned, true otherwise (no email verification check)
  RETURN NOT COALESCE(user_banned, false);
END;
$$;

-- Update increment_vote function to remove email verification check
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

  -- Check if user is banned (remove email verification check)
  SELECT is_banned INTO v_user_banned
  FROM profiles
  WHERE id = v_user_id;

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

-- Update RLS policies to remove email verification requirements
DROP POLICY IF EXISTS "Users can create their own ideas" ON public.ideas;
CREATE POLICY "Users can create their own ideas"
  ON public.ideas FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    public.check_user_verified_and_not_banned() AND
    -- Only admins and authorities can create official proposals
    (
      NOT is_official_proposal OR 
      public.can_create_official_proposals()
    )
  );

DROP POLICY IF EXISTS "Users can vote once per idea" ON public.votes;
CREATE POLICY "Users can vote once per idea"
  ON public.votes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    public.check_user_verified_and_not_banned()
  );

-- Add comment documenting the temporary change
COMMENT ON FUNCTION public.check_user_verified_and_not_banned() IS 'Validates user is not banned (email verification temporarily disabled for development)';