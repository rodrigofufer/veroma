-- Create proposals table if not exists
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) <= 150),
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('infraestructura', 'salud', 'seguridad', 'educacion', 'ambiente', 'transporte', 'cultura', 'economia', 'otro')),
  location_level TEXT NOT NULL CHECK (location_level IN ('colonia', 'ciudad', 'estado', 'pais', 'continente', 'global')),
  location_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  status TEXT NOT NULL DEFAULT 'abierta' CHECK (status IN ('abierta', 'cerrada', 'rechazada')),
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0
);

-- Drop existing votes table and related objects if they exist
DROP TRIGGER IF EXISTS on_vote_changed ON public.votes;
DROP FUNCTION IF EXISTS update_vote_counts();
DROP TABLE IF EXISTS public.votes;

-- Create votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  voted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(proposal_id, user_id)
);

-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view any proposal" ON proposals;
DROP POLICY IF EXISTS "Users can create their own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can update their own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can view any vote" ON votes;
DROP POLICY IF EXISTS "Users can vote once per proposal" ON votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON votes;

-- Recreate policies
CREATE POLICY "Users can view any proposal"
  ON proposals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own proposals"
  ON proposals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proposals"
  ON proposals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view any vote"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote once per proposal"
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

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_proposals_location;
DROP INDEX IF EXISTS idx_proposals_category;
DROP INDEX IF EXISTS idx_proposals_status;
DROP INDEX IF EXISTS idx_votes_proposal_user;

-- Recreate indexes
CREATE INDEX idx_proposals_location ON proposals (location_level, location_value);
CREATE INDEX idx_proposals_category ON proposals (category);
CREATE INDEX idx_proposals_status ON proposals (status);
CREATE INDEX idx_votes_proposal_user ON votes (proposal_id, user_id);

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- If vote is being deleted, decrement the corresponding counter
  IF (TG_OP = 'DELETE') THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE proposals SET upvotes = greatest(0, upvotes - 1) WHERE id = OLD.proposal_id;
    ELSE
      UPDATE proposals SET downvotes = greatest(0, downvotes - 1) WHERE id = OLD.proposal_id;
    END IF;
    RETURN OLD;
  END IF;

  -- For INSERT or UPDATE
  IF (TG_OP = 'INSERT') THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE proposals SET upvotes = upvotes + 1 WHERE id = NEW.proposal_id;
    ELSE
      UPDATE proposals SET downvotes = downvotes + 1 WHERE id = NEW.proposal_id;
    END IF;
  ELSIF (TG_OP = 'UPDATE' AND OLD.vote_type != NEW.vote_type) THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE proposals 
      SET upvotes = upvotes + 1,
          downvotes = greatest(0, downvotes - 1)
      WHERE id = NEW.proposal_id;
    ELSE
      UPDATE proposals 
      SET downvotes = downvotes + 1,
          upvotes = greatest(0, upvotes - 1)
      WHERE id = NEW.proposal_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for vote counting
CREATE TRIGGER on_vote_changed
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();