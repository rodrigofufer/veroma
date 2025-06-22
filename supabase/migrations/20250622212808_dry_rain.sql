-- This migration fixes any inconsistencies in vote counts by recalculating
-- from actual votes

-- Create a function to recalculate vote counts for all ideas
CREATE OR REPLACE FUNCTION recalculate_vote_counts()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
  idea_rec RECORD;
  up_count INTEGER;
  down_count INTEGER;
BEGIN
  updated_count := 0;
  
  -- Process each idea
  FOR idea_rec IN SELECT id FROM ideas LOOP
    -- Count upvotes
    SELECT COUNT(*) INTO up_count 
    FROM votes 
    WHERE idea_id = idea_rec.id AND vote_type = 'up';
    
    -- Count downvotes
    SELECT COUNT(*) INTO down_count 
    FROM votes 
    WHERE idea_id = idea_rec.id AND vote_type = 'down';
    
    -- Update only if counts differ from current values
    UPDATE ideas 
    SET upvotes = up_count, downvotes = down_count
    WHERE id = idea_rec.id 
      AND (upvotes != up_count OR downvotes != down_count);
      
    IF FOUND THEN
      updated_count := updated_count + 1;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Vote counts recalculated',
    'ideas_updated', updated_count
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error recalculating vote counts: ' || SQLERRM
    );
END;
$$;

-- Run the recalculation function
SELECT recalculate_vote_counts();

-- Grant execute permission
GRANT EXECUTE ON FUNCTION recalculate_vote_counts() TO authenticated;

-- Add documentation
COMMENT ON FUNCTION recalculate_vote_counts() IS 'Recalculates and fixes inconsistencies in idea vote counts';