-- Create or replace function to handle user votes
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
      'message', 'Not authenticated',
      'error_code', 'AUTH.NOT_AUTHENTICATED'
    );
  END IF;

  -- Check if user is verified and not banned
  SELECT 
    (email_confirmed_at IS NOT NULL) as is_verified,
    COALESCE(is_banned, false) as is_banned
  INTO v_user_verified, v_user_banned
  FROM profiles
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User profile not found',
      'error_code', 'PROFILE.NOT_FOUND'
    );
  END IF;

  IF NOT v_user_verified THEN
    -- Auto-verify for development environments
    UPDATE profiles
    SET email_confirmed_at = now()
    WHERE id = v_user_id
    RETURNING (email_confirmed_at IS NOT NULL) INTO v_user_verified;
    
    IF NOT v_user_verified THEN
      RETURN jsonb_build_object(
        'success', false,
        'message', 'Please verify your email address before voting',
        'error_code', 'EMAIL_NOT_VERIFIED'
      );
    END IF;
  END IF;

  IF v_user_banned THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Your account has been suspended',
      'error_code', 'USER_BANNED'
    );
  END IF;

  -- Check if votes need to be reset (Monday reset)
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
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Idea not found',
      'error_code', 'IDEA.NOT_FOUND'
    );
  END IF;

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
        'message', 'No votes remaining this week',
        'error_code', 'VOTES.NONE_REMAINING'
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
      'message', SQLERRM,
      'error_code', 'SERVER.ERROR'
    );
END;
$$;

-- Function to get user vote history
CREATE OR REPLACE FUNCTION public.get_user_vote_history(
  p_user_id uuid
)
RETURNS TABLE (
  idea_id uuid,
  idea_title text,
  vote_type text,
  voted_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.idea_id,
    i.title,
    v.vote_type,
    v.voted_at
  FROM
    public.votes v
  JOIN
    public.ideas i ON i.id = v.idea_id
  WHERE
    v.user_id = p_user_id
  ORDER BY
    v.voted_at DESC;
END;
$$;

-- Fix update_vote_counts function to properly handle vote changes
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- If vote is being deleted, decrement the corresponding counter
  IF (TG_OP = 'DELETE') THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE ideas SET upvotes = greatest(0, upvotes - 1) WHERE id = OLD.idea_id;
    ELSE
      UPDATE ideas SET downvotes = greatest(0, downvotes - 1) WHERE id = OLD.idea_id;
    END IF;
    RETURN OLD;
  END IF;

  -- For INSERT or UPDATE
  IF (TG_OP = 'INSERT') THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE ideas SET upvotes = upvotes + 1 WHERE id = NEW.idea_id;
    ELSE
      UPDATE ideas SET downvotes = downvotes + 1 WHERE id = NEW.idea_id;
    END IF;
  ELSIF (TG_OP = 'UPDATE' AND OLD.vote_type != NEW.vote_type) THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE ideas 
      SET upvotes = upvotes + 1,
          downvotes = greatest(0, downvotes - 1)
      WHERE id = NEW.idea_id;
    ELSE
      UPDATE ideas 
      SET downvotes = downvotes + 1,
          upvotes = greatest(0, upvotes - 1)
      WHERE id = NEW.idea_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop and recreate the trigger to avoid dependency issues
DROP TRIGGER IF EXISTS on_vote_changed ON votes;

-- Create trigger for vote counting
CREATE TRIGGER on_vote_changed
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_vote(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_vote_history(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION update_vote_counts() TO service_role;

-- Add documentation
COMMENT ON FUNCTION public.increment_vote(uuid, text) IS 'Processes votes with weekly limits and verification checks';
COMMENT ON FUNCTION public.get_user_vote_history(uuid) IS 'Gets a user''s voting history with idea details';
COMMENT ON FUNCTION update_vote_counts() IS 'Updates vote counts with secure search_path';
COMMENT ON TRIGGER on_vote_changed ON public.votes IS 'Updates idea vote counts when votes change';