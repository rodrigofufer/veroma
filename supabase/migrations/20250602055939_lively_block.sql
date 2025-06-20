-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_vote_history;

-- Create function to get user's vote history with explicit column references
CREATE OR REPLACE FUNCTION get_user_vote_history(user_id_param uuid)
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
        v.idea_id,        -- Explicitly reference from votes table
        i.title AS idea_title,
        v.vote_type,      -- Use vote_type instead of vote
        v.voted_at
    FROM
        public.votes v
    JOIN
        public.ideas i ON v.idea_id = i.id
    WHERE
        v.user_id = user_id_param
    ORDER BY
        v.voted_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_vote_history(uuid) TO authenticated;