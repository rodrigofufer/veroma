/*
  # Fix profiles table RLS policies

  1. Changes
    - Enable RLS on profiles table (if not already enabled)
    - Add INSERT policy to allow new users to create their profile during signup
    - Add UPDATE policy to allow users to modify their own profile
    - Add SELECT policy to allow viewing profiles
    - Add DELETE policy to allow users to delete their own profile

  2. Security
    - Ensures users can only create their own profile
    - Maintains existing security while fixing the signup flow
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role has full access" ON profiles;

-- Create comprehensive policies
CREATE POLICY "Allow users to create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to delete their own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Add service role policy for administrative access
CREATE POLICY "Service role has full access"
  ON profiles
  TO service_role
  USING (true)
  WITH CHECK (true);