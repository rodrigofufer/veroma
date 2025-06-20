/*
  # Add type column to proposals table

  1. Changes
    - Add 'type' column to proposals table with appropriate constraints
    - Add check constraint to ensure valid types
    - Set default value to 'proposal'

  2. Security
    - No changes to RLS policies needed
*/

ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'proposal'
CHECK (type = ANY (ARRAY['complaint'::text, 'proposal'::text, 'vote'::text]));

-- Add comment to explain the column usage
COMMENT ON COLUMN proposals.type IS 'The type of the proposal: complaint, proposal, or vote';