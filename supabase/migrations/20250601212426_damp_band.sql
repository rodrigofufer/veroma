-- Add new columns to ideas table
ALTER TABLE public.ideas
ADD COLUMN IF NOT EXISTS location_value TEXT,
ADD COLUMN IF NOT EXISTS location_level TEXT CHECK (location_level IN ('colonia', 'ciudad', 'estado', 'pais', 'continente', 'global')),
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('infraestructura', 'salud', 'seguridad', 'educacion', 'ambiente', 'transporte', 'cultura', 'economia', 'otro'));

-- Update existing rows to have default values
UPDATE public.ideas
SET location_value = location,
    location_level = 'ciudad',
    category = 'otro'
WHERE location_value IS NULL;

-- Make the new columns required after setting defaults
ALTER TABLE public.ideas
ALTER COLUMN location_value SET NOT NULL,
ALTER COLUMN location_level SET NOT NULL,
ALTER COLUMN category SET NOT NULL;