/*
  # Create comprehensive audit log system

  1. New Tables
    - `audit_log` - Tracks all changes to sensitive tables
      - `id` (uuid, primary key)
      - `actor_user_id` (uuid, references profiles)
      - `action_type` (text, INSERT/UPDATE/DELETE)
      - `target_entity_type` (text, table name)
      - `target_entity_id` (uuid, record ID)
      - `details` (jsonb, change details)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on audit_log table
    - Allow 'administrator' and 'authority' roles to SELECT
    - Create triggers for ideas and profiles tables

  3. Triggers
    - AFTER INSERT/UPDATE/DELETE on ideas table
    - AFTER UPDATE on profiles table (for bans/strikes)
    - Capture user who performed action and relevant changes
*/

-- ============================================================================
-- CREATE AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type text NOT NULL CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE')),
  target_entity_type text NOT NULL,
  target_entity_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_user ON public.audit_log (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action_type ON public.audit_log (action_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_type ON public.audit_log (target_entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_id ON public.audit_log (target_entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at);

-- ============================================================================
-- RLS POLICIES FOR AUDIT LOG
-- ============================================================================

-- Only administrators and authorities can view audit logs
CREATE POLICY "Admins and authorities can view audit log"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (public.is_admin_or_authority());

-- Service role has full access for system operations
CREATE POLICY "Service role has full access to audit log"
  ON public.audit_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- AUDIT LOG UTILITY FUNCTIONS
-- ============================================================================

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION public.create_audit_log_entry(
  p_actor_user_id uuid,
  p_action_type text,
  p_target_entity_type text,
  p_target_entity_id uuid,
  p_details jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  audit_id uuid;
BEGIN
  INSERT INTO public.audit_log (
    actor_user_id,
    action_type,
    target_entity_type,
    target_entity_id,
    details
  )
  VALUES (
    p_actor_user_id,
    p_action_type,
    p_target_entity_type,
    p_target_entity_id,
    p_details
  )
  RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Function to get current user ID (handles both authenticated and service role contexts)
CREATE OR REPLACE FUNCTION public.get_current_actor_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Try to get authenticated user ID first
  current_user_id := auth.uid();
  
  -- If no authenticated user, this might be a system operation
  -- In that case, we'll return NULL and the trigger will handle it appropriately
  RETURN current_user_id;
END;
$$;

-- ============================================================================
-- IDEAS TABLE AUDIT TRIGGERS
-- ============================================================================

-- Function to audit ideas table changes
CREATE OR REPLACE FUNCTION public.audit_ideas_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_id uuid;
  change_details jsonb;
  idea_id uuid;
BEGIN
  -- Get the current actor (user performing the action)
  actor_id := public.get_current_actor_id();
  
  -- Determine the idea ID based on operation
  CASE TG_OP
    WHEN 'DELETE' THEN
      idea_id := OLD.id;
    ELSE
      idea_id := NEW.id;
  END CASE;

  -- Build change details based on operation type
  CASE TG_OP
    WHEN 'INSERT' THEN
      change_details := jsonb_build_object(
        'operation', 'INSERT',
        'new_record', jsonb_build_object(
          'title', NEW.title,
          'description', NEW.description,
          'type', NEW.type,
          'category', NEW.category,
          'location_value', NEW.location_value,
          'location_level', NEW.location_level,
          'country', NEW.country,
          'is_anonymous', NEW.is_anonymous,
          'is_official_proposal', NEW.is_official_proposal,
          'voting_ends_at', NEW.voting_ends_at
        ),
        'timestamp', now(),
        'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
      );

    WHEN 'UPDATE' THEN
      change_details := jsonb_build_object(
        'operation', 'UPDATE',
        'changed_fields', jsonb_build_object(
          'title', CASE WHEN OLD.title != NEW.title THEN 
            jsonb_build_object('old', OLD.title, 'new', NEW.title) 
            ELSE NULL END,
          'description', CASE WHEN OLD.description != NEW.description THEN 
            jsonb_build_object('old', OLD.description, 'new', NEW.description) 
            ELSE NULL END,
          'type', CASE WHEN OLD.type != NEW.type THEN 
            jsonb_build_object('old', OLD.type, 'new', NEW.type) 
            ELSE NULL END,
          'category', CASE WHEN OLD.category != NEW.category THEN 
            jsonb_build_object('old', OLD.category, 'new', NEW.category) 
            ELSE NULL END,
          'location_value', CASE WHEN OLD.location_value != NEW.location_value THEN 
            jsonb_build_object('old', OLD.location_value, 'new', NEW.location_value) 
            ELSE NULL END,
          'location_level', CASE WHEN OLD.location_level != NEW.location_level THEN 
            jsonb_build_object('old', OLD.location_level, 'new', NEW.location_level) 
            ELSE NULL END,
          'country', CASE WHEN OLD.country != NEW.country THEN 
            jsonb_build_object('old', OLD.country, 'new', NEW.country) 
            ELSE NULL END,
          'is_anonymous', CASE WHEN OLD.is_anonymous != NEW.is_anonymous THEN 
            jsonb_build_object('old', OLD.is_anonymous, 'new', NEW.is_anonymous) 
            ELSE NULL END,
          'is_official_proposal', CASE WHEN OLD.is_official_proposal != NEW.is_official_proposal THEN 
            jsonb_build_object('old', OLD.is_official_proposal, 'new', NEW.is_official_proposal) 
            ELSE NULL END,
          'voting_ends_at', CASE WHEN OLD.voting_ends_at IS DISTINCT FROM NEW.voting_ends_at THEN 
            jsonb_build_object('old', OLD.voting_ends_at, 'new', NEW.voting_ends_at) 
            ELSE NULL END,
          'upvotes', CASE WHEN OLD.upvotes != NEW.upvotes THEN 
            jsonb_build_object('old', OLD.upvotes, 'new', NEW.upvotes) 
            ELSE NULL END,
          'downvotes', CASE WHEN OLD.downvotes != NEW.downvotes THEN 
            jsonb_build_object('old', OLD.downvotes, 'new', NEW.downvotes) 
            ELSE NULL END
        ),
        'timestamp', now(),
        'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
      );

    WHEN 'DELETE' THEN
      change_details := jsonb_build_object(
        'operation', 'DELETE',
        'deleted_record', jsonb_build_object(
          'title', OLD.title,
          'description', OLD.description,
          'type', OLD.type,
          'category', OLD.category,
          'location_value', OLD.location_value,
          'location_level', OLD.location_level,
          'country', OLD.country,
          'is_anonymous', OLD.is_anonymous,
          'is_official_proposal', OLD.is_official_proposal,
          'upvotes', OLD.upvotes,
          'downvotes', OLD.downvotes,
          'created_at', OLD.created_at
        ),
        'timestamp', now(),
        'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
      );
  END CASE;

  -- Create audit log entry
  PERFORM public.create_audit_log_entry(
    actor_id,
    TG_OP,
    'ideas',
    idea_id,
    change_details
  );

  -- Return appropriate record
  CASE TG_OP
    WHEN 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
  END CASE;
END;
$$;

-- Create trigger for ideas table
DROP TRIGGER IF EXISTS audit_ideas_trigger ON public.ideas;
CREATE TRIGGER audit_ideas_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_ideas_changes();

-- ============================================================================
-- PROFILES TABLE AUDIT TRIGGERS
-- ============================================================================

-- Function to audit profiles table changes (focusing on moderation actions)
CREATE OR REPLACE FUNCTION public.audit_profiles_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_id uuid;
  change_details jsonb;
  profile_id uuid;
  significant_change boolean := false;
BEGIN
  -- Get the current actor (user performing the action)
  actor_id := public.get_current_actor_id();
  profile_id := NEW.id;

  -- Check if this is a significant change we want to audit
  -- We're particularly interested in moderation-related changes
  IF OLD.is_banned != NEW.is_banned OR 
     OLD.strikes != NEW.strikes OR 
     OLD.role != NEW.role THEN
    significant_change := true;
  END IF;

  -- Only audit significant changes to avoid noise
  IF significant_change THEN
    change_details := jsonb_build_object(
      'operation', 'UPDATE',
      'changed_fields', jsonb_build_object(
        'is_banned', CASE WHEN OLD.is_banned != NEW.is_banned THEN 
          jsonb_build_object('old', OLD.is_banned, 'new', NEW.is_banned) 
          ELSE NULL END,
        'strikes', CASE WHEN OLD.strikes != NEW.strikes THEN 
          jsonb_build_object('old', OLD.strikes, 'new', NEW.strikes) 
          ELSE NULL END,
        'role', CASE WHEN OLD.role != NEW.role THEN 
          jsonb_build_object('old', OLD.role, 'new', NEW.role) 
          ELSE NULL END,
        'name', CASE WHEN OLD.name != NEW.name THEN 
          jsonb_build_object('old', OLD.name, 'new', NEW.name) 
          ELSE NULL END,
        'country', CASE WHEN OLD.country != NEW.country THEN 
          jsonb_build_object('old', OLD.country, 'new', NEW.country) 
          ELSE NULL END
      ),
      'target_user', jsonb_build_object(
        'id', NEW.id,
        'name', NEW.name,
        'email', NEW.email
      ),
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    );

    -- Create audit log entry
    PERFORM public.create_audit_log_entry(
      actor_id,
      'UPDATE',
      'profiles',
      profile_id,
      change_details
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for profiles table (UPDATE only, focusing on moderation changes)
DROP TRIGGER IF EXISTS audit_profiles_trigger ON public.profiles;
CREATE TRIGGER audit_profiles_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profiles_changes();

-- ============================================================================
-- VOTES TABLE AUDIT TRIGGERS (Optional - for comprehensive tracking)
-- ============================================================================

-- Function to audit votes table changes
CREATE OR REPLACE FUNCTION public.audit_votes_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_id uuid;
  change_details jsonb;
  vote_id uuid;
BEGIN
  -- Get the current actor (user performing the action)
  actor_id := public.get_current_actor_id();
  
  -- Determine the vote ID based on operation
  CASE TG_OP
    WHEN 'DELETE' THEN
      vote_id := OLD.id;
    ELSE
      vote_id := NEW.id;
  END CASE;

  -- Build change details based on operation type
  CASE TG_OP
    WHEN 'INSERT' THEN
      change_details := jsonb_build_object(
        'operation', 'INSERT',
        'new_record', jsonb_build_object(
          'idea_id', NEW.idea_id,
          'user_id', NEW.user_id,
          'vote_type', NEW.vote_type
        ),
        'timestamp', now()
      );

    WHEN 'UPDATE' THEN
      change_details := jsonb_build_object(
        'operation', 'UPDATE',
        'changed_fields', jsonb_build_object(
          'vote_type', CASE WHEN OLD.vote_type != NEW.vote_type THEN 
            jsonb_build_object('old', OLD.vote_type, 'new', NEW.vote_type) 
            ELSE NULL END
        ),
        'timestamp', now()
      );

    WHEN 'DELETE' THEN
      change_details := jsonb_build_object(
        'operation', 'DELETE',
        'deleted_record', jsonb_build_object(
          'idea_id', OLD.idea_id,
          'user_id', OLD.user_id,
          'vote_type', OLD.vote_type,
          'voted_at', OLD.voted_at
        ),
        'timestamp', now()
      );
  END CASE;

  -- Create audit log entry
  PERFORM public.create_audit_log_entry(
    actor_id,
    TG_OP,
    'votes',
    vote_id,
    change_details
  );

  -- Return appropriate record
  CASE TG_OP
    WHEN 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
  END CASE;
END;
$$;

-- Create trigger for votes table
DROP TRIGGER IF EXISTS audit_votes_trigger ON public.votes;
CREATE TRIGGER audit_votes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_votes_changes();

-- ============================================================================
-- AUDIT LOG QUERY FUNCTIONS
-- ============================================================================

-- Function to get audit logs with filtering (admin only)
CREATE OR REPLACE FUNCTION public.get_audit_logs(
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_actor_id uuid DEFAULT NULL,
  p_action_type text DEFAULT NULL,
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  actor_user_id uuid,
  actor_name text,
  action_type text,
  target_entity_type text,
  target_entity_id uuid,
  details jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Check if current user is admin or authority
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();

  IF current_user_role NOT IN ('administrator', 'authority') THEN
    RAISE EXCEPTION 'Insufficient permissions to view audit logs';
  END IF;

  RETURN QUERY
  SELECT 
    al.id,
    al.actor_user_id,
    p.name as actor_name,
    al.action_type,
    al.target_entity_type,
    al.target_entity_id,
    al.details,
    al.created_at
  FROM audit_log al
  LEFT JOIN profiles p ON al.actor_user_id = p.id
  WHERE 
    (p_entity_type IS NULL OR al.target_entity_type = p_entity_type) AND
    (p_entity_id IS NULL OR al.target_entity_id = p_entity_id) AND
    (p_actor_id IS NULL OR al.actor_user_id = p_actor_id) AND
    (p_action_type IS NULL OR al.action_type = p_action_type)
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to get audit summary statistics (admin only)
CREATE OR REPLACE FUNCTION public.get_audit_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role text;
  summary_data jsonb;
BEGIN
  -- Check if current user is admin or authority
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();

  IF current_user_role NOT IN ('administrator', 'authority') THEN
    RAISE EXCEPTION 'Insufficient permissions to view audit summary';
  END IF;

  -- Build summary statistics
  SELECT jsonb_build_object(
    'total_entries', (SELECT COUNT(*) FROM audit_log),
    'entries_last_24h', (
      SELECT COUNT(*) 
      FROM audit_log 
      WHERE created_at >= now() - interval '24 hours'
    ),
    'entries_by_type', (
      SELECT jsonb_object_agg(target_entity_type, count)
      FROM (
        SELECT target_entity_type, COUNT(*) as count
        FROM audit_log
        GROUP BY target_entity_type
      ) entity_counts
    ),
    'entries_by_action', (
      SELECT jsonb_object_agg(action_type, count)
      FROM (
        SELECT action_type, COUNT(*) as count
        FROM audit_log
        GROUP BY action_type
      ) action_counts
    ),
    'most_active_users', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'user_id', actor_user_id,
          'user_name', actor_name,
          'action_count', action_count
        )
      )
      FROM (
        SELECT 
          al.actor_user_id,
          p.name as actor_name,
          COUNT(*) as action_count
        FROM audit_log al
        LEFT JOIN profiles p ON al.actor_user_id = p.id
        WHERE al.created_at >= now() - interval '7 days'
          AND al.actor_user_id IS NOT NULL
        GROUP BY al.actor_user_id, p.name
        ORDER BY action_count DESC
        LIMIT 10
      ) active_users
    )
  ) INTO summary_data;

  RETURN summary_data;
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions for audit functions
GRANT EXECUTE ON FUNCTION public.create_audit_log_entry(uuid, text, text, uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_current_actor_id() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_audit_logs(text, uuid, uuid, text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_summary() TO authenticated;

-- Grant trigger function permissions
GRANT EXECUTE ON FUNCTION public.audit_ideas_changes() TO service_role;
GRANT EXECUTE ON FUNCTION public.audit_profiles_changes() TO service_role;
GRANT EXECUTE ON FUNCTION public.audit_votes_changes() TO service_role;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

-- Add comments for documentation
COMMENT ON TABLE public.audit_log IS 'Comprehensive audit trail for all sensitive table changes';
COMMENT ON COLUMN public.audit_log.actor_user_id IS 'User who performed the action (NULL for system actions)';
COMMENT ON COLUMN public.audit_log.action_type IS 'Type of action: INSERT, UPDATE, or DELETE';
COMMENT ON COLUMN public.audit_log.target_entity_type IS 'Table name that was modified';
COMMENT ON COLUMN public.audit_log.target_entity_id IS 'ID of the record that was modified';
COMMENT ON COLUMN public.audit_log.details IS 'JSON details of what changed';

COMMENT ON FUNCTION public.create_audit_log_entry(uuid, text, text, uuid, jsonb) IS 'Creates audit log entries for tracking changes';
COMMENT ON FUNCTION public.get_current_actor_id() IS 'Gets current user ID for audit logging';
COMMENT ON FUNCTION public.get_audit_logs(text, uuid, uuid, text, integer, integer) IS 'Retrieves filtered audit logs - Admin only';
COMMENT ON FUNCTION public.get_audit_summary() IS 'Gets audit log summary statistics - Admin only';

COMMENT ON FUNCTION public.audit_ideas_changes() IS 'Trigger function to audit ideas table changes';
COMMENT ON FUNCTION public.audit_profiles_changes() IS 'Trigger function to audit profiles table changes';
COMMENT ON FUNCTION public.audit_votes_changes() IS 'Trigger function to audit votes table changes';

-- Add final setup comment
COMMENT ON TRIGGER audit_ideas_trigger ON public.ideas IS 'Audits all changes to ideas table';
COMMENT ON TRIGGER audit_profiles_trigger ON public.profiles IS 'Audits moderation-related changes to profiles table';
COMMENT ON TRIGGER audit_votes_trigger ON public.votes IS 'Audits all changes to votes table';