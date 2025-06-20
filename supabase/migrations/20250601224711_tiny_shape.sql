-- Add DELETE policy for ideas table
CREATE POLICY "Users can delete their own ideas" ON public.ideas
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;