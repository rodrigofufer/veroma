/*
  # Fix proposals table foreign key relationship

  1. Changes
    - Add foreign key constraint from proposals.user_id to profiles.id
    - This enables proper joining between proposals and profiles tables
    - Allows fetching author names when querying proposals

  2. Security
    - No changes to RLS policies
    - Maintains existing table permissions
*/

DO $$ BEGIN
  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_proposals_user_id'
  ) THEN
    ALTER TABLE public.proposals
    ADD CONSTRAINT fk_proposals_user_id
    FOREIGN KEY (user_id)
    REFERENCES public.profiles (id)
    ON DELETE CASCADE;
  END IF;
END $$;