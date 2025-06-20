-- First ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow users to create their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to view all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role has full access" ON profiles;
DROP POLICY IF EXISTS "Service role can create profiles during signup" ON profiles;

-- Create comprehensive policies
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

-- Critical: Allow service role full access for signup and administrative purposes
CREATE POLICY "Service role has full access"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);