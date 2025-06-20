-- First make location nullable to avoid constraint violations
ALTER TABLE public.ideas
ALTER COLUMN location DROP NOT NULL;

-- Update existing rows to ensure location_value has values
UPDATE public.ideas
SET location_value = COALESCE(location_value, location)
WHERE location_value IS NULL;

-- Make location_value required
ALTER TABLE public.ideas
ALTER COLUMN location_value SET NOT NULL;

-- Add check constraint for location_level if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.constraint_column_usage 
    WHERE table_name = 'ideas' AND column_name = 'location_level'
  ) THEN
    ALTER TABLE public.ideas
    ADD CONSTRAINT ideas_location_level_check 
    CHECK (location_level = ANY (ARRAY['colonia'::text, 'ciudad'::text, 'estado'::text, 'pais'::text, 'continente'::text, 'global'::text]));
  END IF;
END $$;