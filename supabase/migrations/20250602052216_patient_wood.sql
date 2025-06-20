-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Ideas are viewable by everyone" ON public.ideas;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create new policies that allow both authenticated and anonymous users to view data
CREATE POLICY "Ideas are viewable by everyone including anonymous users"
ON public.ideas
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Profiles are viewable by everyone including anonymous users"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- Create a secure function for fetching public stats
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_ideas INTEGER;
  total_users INTEGER;
  total_countries INTEGER;
BEGIN
  -- Get total ideas
  SELECT COUNT(*) INTO total_ideas FROM public.ideas;
  
  -- Get total users
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  
  -- Get total countries
  SELECT COUNT(DISTINCT country) INTO total_countries 
  FROM public.profiles 
  WHERE country IS NOT NULL AND country != '';

  RETURN jsonb_build_object(
    'totalIdeas', total_ideas,
    'totalUsers', total_users,
    'totalCountries', total_countries
  );
END;
$$;