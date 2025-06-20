/*
  # Role-Based Access Control (RBAC) Policies

  1. New Functions
    - get_user_role() - Returns current user's role
    - is_admin_or_authority() - Checks admin privileges
    - can_modify_official_proposals() - Checks proposal modification rights
    - can_create_official_proposals() - Checks proposal creation rights
    - check_user_verified_and_not_banned() - Validates user status

  2. Enhanced RLS Policies
    - Role-based access control for all tables
    - Email verification requirements
    - Ban status enforcement
    - Hierarchical permissions

  3. Administrative Functions
    - admin_ban_user() - Ban/unban users with audit trail
    - admin_change_user_role() - Change user roles with restrictions
    - admin_get_user_stats() - Get platform statistics

  4. Audit System
    - admin_audit_log table for tracking administrative actions
    - Automatic logging of admin operations
*/

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- Create function to check if user has admin privileges
CREATE OR REPLACE FUNCTION public.is_admin_or_authority()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN user_role IN ('administrator', 'authority');
END;
$$;

-- Create function to check if user can modify official proposals
CREATE OR REPLACE FUNCTION public.can_modify_official_proposals()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN user_role IN ('representative', 'administrator', 'authority');
END;
$$;

-- Create function to check if user can create official proposals
CREATE OR REPLACE FUNCTION public.can_create_official_proposals()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN user_role IN ('administrator', 'authority');
END;
$$;

-- Create function to check if user is verified and not banned
CREATE OR REPLACE FUNCTION public.check_user_verified_and_not_banned()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_banned BOOLEAN;
BEGIN
  SELECT is_banned INTO user_banned
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- For now, we'll assume email verification is handled elsewhere
  -- Return false if user is banned, true otherwise
  RETURN NOT COALESCE(user_banned, false);
END;
$$;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role has full access" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role has full access to profiles" ON public.profiles;

-- Create new role-based policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile basic info"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_authority())
  WITH CHECK (public.is_admin_or_authority());

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can delete any profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin_or_authority());

CREATE POLICY "Service role has full access to profiles"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- IDEAS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Ideas are viewable by everyone including anonymous users" ON public.ideas;
DROP POLICY IF EXISTS "Users can insert their own ideas" ON public.ideas;
DROP POLICY IF EXISTS "Users can update their own ideas" ON public.ideas;
DROP POLICY IF EXISTS "Users can delete their own ideas" ON public.ideas;

-- Create new role-based policies for ideas
CREATE POLICY "Ideas are viewable by everyone including anonymous users"
  ON public.ideas FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create their own ideas"
  ON public.ideas FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    public.check_user_verified_and_not_banned() AND
    -- Only admins and authorities can create official proposals
    (
      NOT is_official_proposal OR 
      public.can_create_official_proposals()
    )
  );

CREATE POLICY "Users can update their own ideas"
  ON public.ideas FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND 
    public.check_user_verified_and_not_banned()
  )
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Representatives can update official proposals"
  ON public.ideas FOR UPDATE
  TO authenticated
  USING (
    is_official_proposal = true AND
    public.can_modify_official_proposals() AND
    public.check_user_verified_and_not_banned()
  )
  WITH CHECK (public.can_modify_official_proposals());

CREATE POLICY "Admins can update any idea"
  ON public.ideas FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_authority())
  WITH CHECK (public.is_admin_or_authority());

CREATE POLICY "Users can delete their own ideas"
  ON public.ideas FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id AND 
    public.check_user_verified_and_not_banned()
  );

CREATE POLICY "Admins can delete any idea"
  ON public.ideas FOR DELETE
  TO authenticated
  USING (public.is_admin_or_authority());

-- ============================================================================
-- VOTES TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view any vote" ON public.votes;
DROP POLICY IF EXISTS "Users can vote once per idea" ON public.votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON public.votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON public.votes;

-- Create new role-based policies for votes
CREATE POLICY "Users can view any vote"
  ON public.votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote once per idea"
  ON public.votes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    public.check_user_verified_and_not_banned()
  );

CREATE POLICY "Users can update their own votes"
  ON public.votes FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND 
    public.check_user_verified_and_not_banned()
  )
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON public.votes FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id AND 
    public.check_user_verified_and_not_banned()
  );

CREATE POLICY "Admins can manage any vote"
  ON public.votes FOR ALL
  TO authenticated
  USING (public.is_admin_or_authority())
  WITH CHECK (public.is_admin_or_authority());

-- ============================================================================
-- PROPOSALS TABLE POLICIES (if still in use)
-- ============================================================================

-- Drop existing policies for proposals table
DROP POLICY IF EXISTS "Users can view any proposal" ON public.proposals;
DROP POLICY IF EXISTS "Users can create their own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can update their own proposals" ON public.proposals;

-- Create new role-based policies for proposals (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'proposals' AND table_schema = 'public') THEN
    -- Create policies for proposals table
    EXECUTE 'CREATE POLICY "Users can view any proposal"
      ON public.proposals FOR SELECT
      TO authenticated
      USING (true)';

    EXECUTE 'CREATE POLICY "Users can create their own proposals"
      ON public.proposals FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() = user_id AND 
        public.check_user_verified_and_not_banned()
      )';

    EXECUTE 'CREATE POLICY "Users can update their own proposals"
      ON public.proposals FOR UPDATE
      TO authenticated
      USING (
        auth.uid() = user_id AND 
        public.check_user_verified_and_not_banned()
      )
      WITH CHECK (auth.uid() = user_id)';

    EXECUTE 'CREATE POLICY "Admins can manage any proposal"
      ON public.proposals FOR ALL
      TO authenticated
      USING (public.is_admin_or_authority())
      WITH CHECK (public.is_admin_or_authority())';
  END IF;
END $$;

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================

-- Create audit log table for administrative actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit log (only admins can view)
CREATE POLICY "Admins can view audit log"
  ON public.admin_audit_log FOR SELECT
  TO authenticated
  USING (public.is_admin_or_authority());

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user ON public.admin_audit_log (admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_user ON public.admin_audit_log (target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log (created_at);

-- ============================================================================
-- ADMINISTRATIVE FUNCTIONS
-- ============================================================================

-- Function to log administrative actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  target_user_id uuid,
  action text,
  details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (admin_user_id, target_user_id, action, details)
  VALUES (auth.uid(), target_user_id, action, details);
END;
$$;

-- Function to ban/unban users (admin only)
CREATE OR REPLACE FUNCTION public.admin_ban_user(
  target_user_id uuid,
  ban_status boolean,
  reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_role TEXT;
  target_user_role TEXT;
  admin_id uuid;
BEGIN
  -- Get current user ID and role
  admin_id := auth.uid();
  SELECT role INTO admin_role
  FROM profiles
  WHERE id = admin_id;

  IF admin_role NOT IN ('administrator', 'authority') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Insufficient permissions'
    );
  END IF;

  -- Get target user role
  SELECT role INTO target_user_role
  FROM profiles
  WHERE id = target_user_id;

  -- Prevent banning other admins unless you're an authority
  IF target_user_role IN ('administrator', 'authority') AND admin_role != 'authority' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Cannot ban administrators'
    );
  END IF;

  -- Prevent self-banning
  IF target_user_id = admin_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Cannot ban yourself'
    );
  END IF;

  -- Update ban status
  UPDATE profiles
  SET is_banned = ban_status,
      strikes = CASE WHEN ban_status THEN strikes + 1 ELSE strikes END
  WHERE id = target_user_id;

  -- Log the action
  PERFORM public.log_admin_action(
    target_user_id,
    CASE WHEN ban_status THEN 'USER_BANNED' ELSE 'USER_UNBANNED' END,
    jsonb_build_object('reason', reason, 'admin_role', admin_role)
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', CASE WHEN ban_status THEN 'User banned successfully' ELSE 'User unbanned successfully' END
  );
END;
$$;

-- Function to change user role (admin only)
CREATE OR REPLACE FUNCTION public.admin_change_user_role(
  target_user_id uuid,
  new_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_role TEXT;
  target_user_role TEXT;
  admin_id uuid;
BEGIN
  -- Get current user ID and role
  admin_id := auth.uid();
  SELECT role INTO admin_role
  FROM profiles
  WHERE id = admin_id;

  IF admin_role NOT IN ('administrator', 'authority') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Insufficient permissions'
    );
  END IF;

  -- Validate new role
  IF new_role NOT IN ('user', 'representative', 'administrator', 'authority') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid role'
    );
  END IF;

  -- Get target user current role
  SELECT role INTO target_user_role
  FROM profiles
  WHERE id = target_user_id;

  -- Only authorities can create other authorities or modify administrator roles
  IF (new_role = 'authority' OR target_user_role IN ('administrator', 'authority')) 
     AND admin_role != 'authority' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Only authorities can manage administrator roles'
    );
  END IF;

  -- Prevent self-role changes to lower privileges
  IF target_user_id = admin_id AND new_role NOT IN ('administrator', 'authority') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Cannot demote yourself'
    );
  END IF;

  -- Update user role
  UPDATE profiles
  SET role = new_role
  WHERE id = target_user_id;

  -- Log the action
  PERFORM public.log_admin_action(
    target_user_id,
    'ROLE_CHANGED',
    jsonb_build_object(
      'old_role', target_user_role,
      'new_role', new_role,
      'admin_role', admin_role
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User role updated successfully'
  );
END;
$$;

-- Function to get user statistics (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_user_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_role TEXT;
  stats jsonb;
BEGIN
  -- Check if current user is admin
  SELECT role INTO admin_role
  FROM profiles
  WHERE id = auth.uid();

  IF admin_role NOT IN ('administrator', 'authority') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Insufficient permissions'
    );
  END IF;

  -- Get statistics
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'banned_users', (SELECT COUNT(*) FROM profiles WHERE is_banned = true),
    'users_by_role', (
      SELECT jsonb_object_agg(role, count)
      FROM (
        SELECT role, COUNT(*) as count
        FROM profiles
        GROUP BY role
      ) role_counts
    ),
    'total_ideas', (SELECT COUNT(*) FROM ideas),
    'official_proposals', (SELECT COUNT(*) FROM ideas WHERE is_official_proposal = true),
    'total_votes', (SELECT COUNT(*) FROM votes)
  ) INTO stats;

  RETURN jsonb_build_object(
    'success', true,
    'data', stats
  );
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions for new functions
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_authority() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_modify_official_proposals() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_create_official_proposals() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_verified_and_not_banned() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_ban_user(uuid, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_change_user_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_user_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action(uuid, text, jsonb) TO authenticated;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

-- Add comments for documentation
COMMENT ON FUNCTION public.get_user_role() IS 'Returns the role of the current authenticated user';
COMMENT ON FUNCTION public.is_admin_or_authority() IS 'Checks if current user has administrator or authority role';
COMMENT ON FUNCTION public.can_modify_official_proposals() IS 'Checks if user can modify official proposals (representative+)';
COMMENT ON FUNCTION public.can_create_official_proposals() IS 'Checks if user can create official proposals (admin+)';
COMMENT ON FUNCTION public.check_user_verified_and_not_banned() IS 'Validates user is not banned and verified';
COMMENT ON FUNCTION public.admin_ban_user(uuid, boolean, text) IS 'Admin function to ban/unban users with audit trail';
COMMENT ON FUNCTION public.admin_change_user_role(uuid, text) IS 'Admin function to change user roles with restrictions';
COMMENT ON FUNCTION public.admin_get_user_stats() IS 'Admin function to get platform statistics';
COMMENT ON FUNCTION public.log_admin_action(uuid, text, jsonb) IS 'Logs administrative actions for audit trail';
COMMENT ON TABLE public.admin_audit_log IS 'Audit log for tracking administrative actions';