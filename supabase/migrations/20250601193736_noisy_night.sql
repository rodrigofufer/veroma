/*
  # Fix profiles table RLS policies

  1. Changes
    - Adds proper RLS policies for the profiles table to allow:
      - New users to create their own profile during signup
      - Users to read all profiles
      - Users to update their own profile
      - Users to delete their own profile
      - Service role to have full access

  2. Security
    - Ensures RLS is enabled on profiles table
    - Adds specific policies for each operation type
    - Maintains data security by limiting operations to appropriate users
*/

-- First ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow users to create their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to view all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role has full access" ON profiles;

-- Create new policies with proper security rules
CREATE POLICY "Allow users to create their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to delete their own profile"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Allow users to view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Allow service role full access for administrative purposes
CREATE POLICY "Service role has full access"
ON profiles
TO service_role
USING (true)
WITH CHECK (true);