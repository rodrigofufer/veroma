-- Add anonymous flag to ideas table
ALTER TABLE public.ideas
ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT false;

-- Drop existing policies
DROP POLICY IF EXISTS "Ideas are viewable by everyone" ON ideas;
DROP POLICY IF EXISTS "Users can insert their own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can update their own ideas" ON ideas;

-- Create new policies for anonymous ideas
CREATE POLICY "Ideas are viewable by everyone"
  ON ideas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own ideas"
  ON ideas FOR INSERT
  TO authenticated
  WITH CHECK (
    CASE 
      WHEN is_anonymous THEN true
      ELSE auth.uid() = user_id
    END
  );

CREATE POLICY "Users can update their own ideas"
  ON ideas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to handle anonymous ideas in responses
CREATE OR REPLACE FUNCTION public.handle_anonymous_idea()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_anonymous THEN
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for anonymous ideas
DROP TRIGGER IF EXISTS handle_anonymous_idea_trigger ON ideas;
CREATE TRIGGER handle_anonymous_idea_trigger
  BEFORE INSERT OR UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION handle_anonymous_idea();