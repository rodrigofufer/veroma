/*
  # Add INSERT policy for profiles table
  
  1. Security Changes
    - Add INSERT policy to profiles table to allow new user registration
    - Policy ensures users can only create their own profile
    - Policy matches user's auth.uid() with the profile id
*/

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);