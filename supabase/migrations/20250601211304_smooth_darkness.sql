/*
  # Add is_anonymous column to proposals table

  1. Changes
    - Add `is_anonymous` boolean column to `proposals` table with default value of false
    - This allows users to submit proposals anonymously

  2. Technical Details
    - Column type: boolean
    - Default value: false
    - Not nullable
    - Safe operation: Uses IF NOT EXISTS to prevent errors
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'proposals' 
    AND column_name = 'is_anonymous'
  ) THEN
    ALTER TABLE proposals 
    ADD COLUMN is_anonymous boolean NOT NULL DEFAULT false;
  END IF;
END $$;