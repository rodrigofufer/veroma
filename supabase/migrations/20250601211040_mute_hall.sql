/*
  # Add country column to proposals table

  1. Changes
    - Add `country` column to `proposals` table
      - Type: TEXT
      - Not nullable
      - Default value: empty string

  2. Reasoning
    - Required for location-based features
    - Matches existing schema requirements
    - Frontend expects this column for proposal creation and display
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'proposals' 
    AND column_name = 'country'
  ) THEN
    ALTER TABLE proposals 
    ADD COLUMN country TEXT NOT NULL DEFAULT '';
  END IF;
END $$;