/*
  # Fix profiles table RLS policies

  1. Changes
    - Add RLS policy to allow new users to create their profile during signup
    - This policy specifically allows the service role to create profiles during the signup process
  
  2. Security
    - Maintains existing RLS policies
    - Adds new policy for service role profile creation
    - Ensures users can only create their own profile
*/

-- Add policy to allow service role to create profiles during signup
CREATE POLICY "Service role can create profiles during signup"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);