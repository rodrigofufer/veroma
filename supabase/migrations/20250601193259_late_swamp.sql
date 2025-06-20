/*
  # Fix profiles table RLS policies

  1. Changes
    - Enable RLS on profiles table (if not already enabled)
    - Add policy for authenticated users to insert their own profile
    - Add policy for service role to bypass RLS

  2. Security
    - Ensures users can only insert their own profile data
    - Maintains existing policies for SELECT and UPDATE
    - Service role can perform all operations
*/

-- Enable RLS on profiles table (idempotent)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role has full access" ON profiles;

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create policy for service role to have full access
CREATE POLICY "Service role has full access"
ON profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);