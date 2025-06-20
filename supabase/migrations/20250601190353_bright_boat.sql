-- Add custom error codes table for better error handling
CREATE TABLE IF NOT EXISTS public.error_codes (
  code text PRIMARY KEY,
  message text NOT NULL,
  http_status integer NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Insert common error codes
INSERT INTO public.error_codes (code, message, http_status) VALUES
  ('AUTH.EMAIL_NOT_VERIFIED', 'Please verify your email address before continuing.', 403),
  ('AUTH.ACCESS_DENIED', 'You do not have permission to access this resource.', 403),
  ('SERVER.INTERNAL_ERROR', 'An internal server error occurred. Please try again later.', 500),
  ('AUTH.INVALID_CREDENTIALS', 'Invalid email or password.', 401),
  ('AUTH.EMAIL_IN_USE', 'This email is already registered.', 409)
ON CONFLICT (code) DO NOTHING;

-- Enable RLS on error_codes if not already enabled
ALTER TABLE public.error_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Error codes are viewable by everyone" ON public.error_codes;

-- Create new policy
CREATE POLICY "Error codes are viewable by everyone"
  ON public.error_codes FOR SELECT
  TO authenticated
  USING (true);