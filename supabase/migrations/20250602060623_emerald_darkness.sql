-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS public.increment_vote(uuid, text);
DROP FUNCTION IF EXISTS public.get_user_vote_history(uuid);

-- Recreate increment_vote function with explicit column references
CREATE OR REPLACE FUNCTION public.increment_vote(
  p_idea_id uuid,
  p_vote_type text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_existing_vote record;
  v_votes_remaining integer;
  v_message text;
  v_new_upvotes integer;
  v_new_downvotes integer;
  v_vote_removed boolean := false;
BEGIN
  -- Get the current user's ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

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
      RAISE EXCEPTION 'No votes remaining this week';
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

-- Recreate get_user_vote_history function with explicit column references
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
AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.idea_id,
        i.title AS idea_title,
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_vote(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_vote_history(uuid) TO authenticated;