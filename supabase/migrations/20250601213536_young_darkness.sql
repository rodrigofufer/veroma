-- Drop existing foreign key constraints and triggers
DROP TRIGGER IF EXISTS on_vote_changed ON public.votes;
DROP FUNCTION IF EXISTS update_vote_counts();

-- Recreate votes table with correct schema
DROP TABLE IF EXISTS public.votes;
CREATE TABLE public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  voted_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(idea_id, user_id)
);

-- Create function to update vote counts
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for vote counting
CREATE TRIGGER on_vote_changed
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- Enable RLS on votes table
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for votes
CREATE POLICY "Users can view any vote"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote once per idea"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_votes_idea_user ON votes (idea_id, user_id);