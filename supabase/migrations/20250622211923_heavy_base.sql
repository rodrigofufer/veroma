-- ============================================================================
-- CREATE BASIC TABLES
-- ============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  lastname TEXT,
  country TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'representative', 'administrator', 'authority')),
  strikes INTEGER NOT NULL DEFAULT 0,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  votes_remaining INTEGER NOT NULL DEFAULT 10,
  votes_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT date_trunc('week', (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' + INTERVAL '1 week')),
  weekly_vote_limit INTEGER NOT NULL DEFAULT 10
);

-- Create ideas table
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('complaint', 'proposal', 'vote')),
  location TEXT,
  country TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  location_value TEXT NOT NULL,
  location_level TEXT NOT NULL CHECK (location_level IN ('colonia', 'ciudad', 'estado', 'pais', 'continente', 'global')),
  category TEXT NOT NULL CHECK (category IN ('infraestructura', 'salud', 'seguridad', 'educacion', 'ambiente', 'transporte', 'cultura', 'economia', 'otro')),
  is_official_proposal BOOLEAN NOT NULL DEFAULT false,
  voting_ends_at TIMESTAMP WITH TIME ZONE
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(idea_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  is_removed BOOLEAN NOT NULL DEFAULT false,
  moderated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('system', 'moderation', 'info', 'warning', 'success')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE')),
  target_entity_type TEXT NOT NULL,
  target_entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create admin audit log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create error codes table
CREATE TABLE IF NOT EXISTS public.error_codes (
  code TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  http_status INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles (is_banned);

-- Ideas indexes
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON public.ideas (user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_country ON public.ideas (country);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON public.ideas (category);
CREATE INDEX IF NOT EXISTS idx_ideas_type ON public.ideas (type);
CREATE INDEX IF NOT EXISTS idx_ideas_location_level ON public.ideas (location_level, location_value);
CREATE INDEX IF NOT EXISTS idx_ideas_is_official ON public.ideas (is_official_proposal);
CREATE INDEX IF NOT EXISTS idx_ideas_voting_ends ON public.ideas (voting_ends_at);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON public.ideas (created_at);

-- Votes indexes
CREATE INDEX IF NOT EXISTS idx_votes_idea_user ON public.votes (idea_id, user_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes (user_id);
CREATE INDEX IF NOT EXISTS idx_votes_vote_type ON public.votes (vote_type);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON public.comments (idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments (user_id);
CREATE INDEX IF NOT EXISTS idx_comments_is_flagged ON public.comments (is_flagged);
CREATE INDEX IF NOT EXISTS idx_comments_is_removed ON public.comments (is_removed);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments (created_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications (is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications (type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications (expires_at);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_user ON public.audit_log (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action_type ON public.audit_log (action_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_type ON public.audit_log (target_entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_id ON public.audit_log (target_entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at);

-- Admin audit log indexes
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user ON public.admin_audit_log (admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_user ON public.admin_audit_log (target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log (created_at);

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get the current user's role
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

-- Function to check if user is admin or authority
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
  
  RETURN COALESCE(user_role IN ('administrator', 'authority'), FALSE);
END;
$$;

-- Function to check if user can modify official proposals
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
  
  RETURN COALESCE(user_role IN ('representative', 'administrator', 'authority'), FALSE);
END;
$$;

-- Function to check if user can create official proposals
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
  
  RETURN COALESCE(user_role IN ('representative', 'administrator', 'authority'), FALSE);
END;
$$;

-- Function to check if user is verified and not banned
CREATE OR REPLACE FUNCTION public.check_user_verified_and_not_banned()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_status RECORD;
BEGIN
  SELECT 
    (email_confirmed_at IS NOT NULL) as is_verified,
    COALESCE(is_banned, false) as is_banned
  INTO user_status
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_status.is_verified AND NOT user_status.is_banned, FALSE);
END;
$$;

-- ============================================================================
-- USER MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role VARCHAR := 'user';
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    lastname,
    country,
    role,
    strikes,
    is_banned,
    votes_remaining,
    votes_reset_at,
    weekly_vote_limit,
    email_confirmed_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'lastname', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', 'Unknown'),
    default_role,
    0,
    FALSE,
    10,
    date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week')),
    10,
    NEW.email_confirmed_at
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    email_confirmed_at = EXCLUDED.email_confirmed_at;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to sync email confirmation status
CREATE OR REPLACE FUNCTION public.sync_user_email_confirmation(user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  auth_email_confirmed_at TIMESTAMP WITH TIME ZONE;
  profile_exists BOOLEAN;
  auth_user_exists BOOLEAN;
  v_email TEXT;
  v_name TEXT;
  v_country TEXT;
BEGIN
  -- Check if auth user exists
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE id = user_id
  ) INTO auth_user_exists;
  
  IF NOT auth_user_exists THEN
    RAISE NOTICE 'Auth user does not exist: %', user_id;
    RETURN FALSE;
  END IF;

  -- Get user data from auth.users
  SELECT 
    email_confirmed_at, 
    email,
    COALESCE(raw_user_meta_data->>'name', 'User'),
    COALESCE(raw_user_meta_data->>'country', 'Unknown')
  INTO 
    auth_email_confirmed_at,
    v_email,
    v_name,
    v_country
  FROM auth.users
  WHERE id = user_id;
  
  -- Check if profile exists
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = user_id
  ) INTO profile_exists;
  
  IF profile_exists THEN
    -- Update existing profile
    UPDATE public.profiles
    SET 
      email_confirmed_at = auth_email_confirmed_at,
      -- Also update other fields that might be missing
      email = COALESCE(email, v_email),
      name = COALESCE(name, v_name),
      country = COALESCE(country, v_country)
    WHERE id = user_id;
    
    RAISE NOTICE 'Updated email_confirmed_at for existing profile: %', user_id;
  ELSE
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (
      id,
      email,
      name,
      country,
      email_confirmed_at,
      votes_remaining,
      votes_reset_at,
      weekly_vote_limit,
      role,
      strikes,
      is_banned
    )
    SELECT
      user_id,
      v_email,
      v_name,
      v_country,
      auth_email_confirmed_at,
      10, -- votes_remaining
      date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week')), -- votes_reset_at
      10, -- weekly_vote_limit
      'user', -- role
      0, -- strikes
      false -- is_banned
    FROM auth.users
    WHERE id = user_id;
    
    RAISE NOTICE 'Created new profile for user: %', user_id;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in sync_user_email_confirmation: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Function to check if a user's email is verified
CREATE OR REPLACE FUNCTION public.is_user_email_verified(user_id uuid DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_id uuid;
  is_verified BOOLEAN;
BEGIN
  -- Use provided user_id or current user
  target_id := COALESCE(user_id, auth.uid());
  
  IF target_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if email is confirmed in auth.users
  SELECT (email_confirmed_at IS NOT NULL) INTO is_verified
  FROM auth.users
  WHERE id = target_id;
  
  RETURN COALESCE(is_verified, FALSE);
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to force email verification (for admins)
CREATE OR REPLACE FUNCTION public.force_email_verification(user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_role text;
  target_user_exists boolean;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();
  
  IF current_user_role NOT IN ('administrator', 'authority') THEN
    RAISE EXCEPTION 'Only administrators can force email verification';
  END IF;
  
  -- Check if target user exists
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE id = user_id
  ) INTO target_user_exists;
  
  IF NOT target_user_exists THEN
    RAISE EXCEPTION 'User does not exist';
  END IF;
  
  -- Update auth.users to set email_confirmed_at
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE id = user_id;
  
  -- Update profiles table
  UPDATE public.profiles
  SET email_confirmed_at = now()
  WHERE id = user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in force_email_verification: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Function to automatically confirm emails (for development only)
CREATE OR REPLACE FUNCTION auto_confirm_email()
RETURNS trigger AS $$
BEGIN
  -- Set email_confirmed_at for all new users
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = auth;

-- For development environments, uncomment the following line:
-- CREATE TRIGGER auto_confirm_email_trigger BEFORE INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION auto_confirm_email();

-- ============================================================================
-- VOTING SYSTEM FUNCTIONS
-- ============================================================================

-- Function to update vote counts when votes change
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- If vote is being deleted, decrement the corresponding counter
  IF (TG_OP = 'DELETE') THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE ideas SET upvotes = greatest(0, upvotes - 1) WHERE id = OLD.idea_id;
    ELSE
      UPDATE ideas SET downvotes = greatest(0, downvotes - 1) WHERE id = OLD.idea_id;
    END IF;
    RETURN OLD;
  END IF;

  -- For INSERT or UPDATE
  IF (TG_OP = 'INSERT') THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE ideas SET upvotes = upvotes + 1 WHERE id = NEW.idea_id;
    ELSE
      UPDATE ideas SET downvotes = downvotes + 1 WHERE id = NEW.idea_id;
    END IF;
  ELSIF (TG_OP = 'UPDATE' AND OLD.vote_type != NEW.vote_type) THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE ideas 
      SET upvotes = upvotes + 1,
          downvotes = greatest(0, downvotes - 1)
      WHERE id = NEW.idea_id;
    ELSE
      UPDATE ideas 
      SET downvotes = downvotes + 1,
          upvotes = greatest(0, upvotes - 1)
      WHERE id = NEW.idea_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for vote counting
CREATE TRIGGER on_vote_changed
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- Function to handle anonymous ideas
CREATE OR REPLACE FUNCTION public.handle_anonymous_idea()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_anonymous THEN
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for anonymous ideas
CREATE TRIGGER handle_anonymous_idea_trigger
  BEFORE INSERT OR UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION handle_anonymous_idea();

-- Function to increment vote with user validation
CREATE OR REPLACE FUNCTION public.increment_vote(
  p_idea_id uuid,
  p_vote_type text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_existing_vote record;
  v_votes_remaining integer;
  v_message text;
  v_new_upvotes integer;
  v_new_downvotes integer;
  v_vote_removed boolean := false;
  v_user_verified boolean;
  v_user_banned boolean;
BEGIN
  -- Get the current user's ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;

  -- Check if user is verified and not banned
  SELECT 
    (email_confirmed_at IS NOT NULL) as is_verified,
    is_banned
  INTO v_user_verified, v_user_banned
  FROM profiles
  WHERE id = v_user_id;

  IF NOT v_user_verified THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Please verify your email address before voting',
      'error_code', 'EMAIL_NOT_VERIFIED'
    );
  END IF;

  IF v_user_banned THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Your account has been suspended',
      'error_code', 'USER_BANNED'
    );
  END IF;

  -- Check if votes need to be reset
  UPDATE profiles
  SET 
    votes_remaining = weekly_vote_limit,
    votes_reset_at = date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week'))
  WHERE 
    id = v_user_id 
    AND current_timestamp AT TIME ZONE 'UTC' >= votes_reset_at;

  -- Get user's remaining votes
  SELECT votes_remaining INTO v_votes_remaining
  FROM profiles
  WHERE id = v_user_id;

  -- Check if user has already voted on this idea
  SELECT * INTO v_existing_vote
  FROM votes v
  WHERE v.user_id = v_user_id AND v.idea_id = p_idea_id;

  -- Get current vote counts
  SELECT i.upvotes, i.downvotes INTO v_new_upvotes, v_new_downvotes
  FROM ideas i
  WHERE i.id = p_idea_id;

  IF v_existing_vote.id IS NOT NULL THEN
    -- User has already voted
    IF v_existing_vote.vote_type = p_vote_type THEN
      -- Remove the vote if clicking the same type
      DELETE FROM votes WHERE id = v_existing_vote.id;
      
      -- Update vote counts
      IF p_vote_type = 'up' THEN
        v_new_upvotes := greatest(0, v_new_upvotes - 1);
      ELSE
        v_new_downvotes := greatest(0, v_new_downvotes - 1);
      END IF;
      
      -- Return vote to user
      UPDATE profiles p
      SET votes_remaining = p.votes_remaining + 1
      WHERE p.id = v_user_id
      RETURNING p.votes_remaining INTO v_votes_remaining;
      
      v_message := 'Vote removed';
      v_vote_removed := true;
    ELSE
      -- Change vote type
      UPDATE votes v
      SET vote_type = p_vote_type
      WHERE v.id = v_existing_vote.id;
      
      -- Update vote counts
      IF p_vote_type = 'up' THEN
        v_new_upvotes := v_new_upvotes + 1;
        v_new_downvotes := greatest(0, v_new_downvotes - 1);
      ELSE
        v_new_downvotes := v_new_downvotes + 1;
        v_new_upvotes := greatest(0, v_new_upvotes - 1);
      END IF;
      
      v_message := 'Vote changed';
    END IF;
  ELSE
    -- New vote
    IF v_votes_remaining <= 0 THEN
      RETURN jsonb_build_object(
        'success', false,
        'message', 'No votes remaining this week'
      );
    END IF;
    
    -- Insert new vote
    INSERT INTO votes (user_id, idea_id, vote_type)
    VALUES (v_user_id, p_idea_id, p_vote_type);
    
    -- Update vote counts
    IF p_vote_type = 'up' THEN
      v_new_upvotes := v_new_upvotes + 1;
    ELSE
      v_new_downvotes := v_new_downvotes + 1;
    END IF;
    
    -- Decrement votes remaining
    UPDATE profiles p
    SET votes_remaining = p.votes_remaining - 1
    WHERE p.id = v_user_id
    RETURNING p.votes_remaining INTO v_votes_remaining;
    
    v_message := 'Vote recorded';
  END IF;

  -- Update idea vote counts
  UPDATE ideas i
  SET upvotes = v_new_upvotes,
      downvotes = v_new_downvotes
  WHERE i.id = p_idea_id;

  -- Return updated information
  RETURN jsonb_build_object(
    'success', true,
    'message', v_message,
    'new_upvotes', v_new_upvotes,
    'new_downvotes', v_new_downvotes,
    'new_votes_remaining_this_week', v_votes_remaining,
    'vote_removed', v_vote_removed
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', SQLERRM
    );
END;
$$;

-- Function to get user vote history - fixed the quote escape issue
CREATE OR REPLACE FUNCTION public.get_user_vote_history(
  p_user_id uuid
)
RETURNS TABLE (
  idea_id uuid,
  idea_title text,
  vote_type text,
  voted_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.idea_id,
    i.title AS idea_title,
    v.vote_type,
    v.voted_at
  FROM
    public.votes v
  JOIN
    public.ideas i ON i.id = v.idea_id
  WHERE
    v.user_id = p_user_id
  ORDER BY
    v.voted_at DESC;
END;
$$;

-- ============================================================================
-- AUDIT FUNCTIONS
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

-- Function to get current user ID for audit logging
CREATE OR REPLACE FUNCTION public.get_current_actor_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Try to get authenticated user ID
  current_user_id := auth.uid();
  RETURN current_user_id;
END;
$$;

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
        'timestamp', now()
      );

    WHEN 'UPDATE' THEN
      change_details := jsonb_build_object(
        'operation', 'UPDATE',
        'changed_fields', jsonb_build_object(
          'title', CASE WHEN OLD.title != NEW.title THEN 
            jsonb_build_object('old', OLD.title, 'new', NEW.title) 
            ELSE NULL END,
          'description', CASE WHEN OLD.description != NEW.description THEN 
            jsonb_build_object('old', LEFT(OLD.description, 200), 'new', LEFT(NEW.description, 200)) 
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
        'timestamp', now()
      );

    WHEN 'DELETE' THEN
      change_details := jsonb_build_object(
        'operation', 'DELETE',
        'deleted_record', jsonb_build_object(
          'title', OLD.title,
          'description', LEFT(OLD.description, 200),
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
        'timestamp', now()
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
      'timestamp', now()
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

-- Create audit triggers
CREATE TRIGGER audit_ideas_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_ideas_changes();

CREATE TRIGGER audit_profiles_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profiles_changes();

CREATE TRIGGER audit_votes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_votes_changes();

-- ============================================================================
-- ADMIN FUNCTIONS
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

-- Function to assign strikes to users
CREATE OR REPLACE FUNCTION public.assign_strike(
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  moderator_role text;
  moderator_id uuid;
  target_user_role text;
  current_strikes integer;
  new_strikes integer;
  should_ban boolean := false;
BEGIN
  -- Get moderator info
  moderator_id := auth.uid();
  SELECT role INTO moderator_role
  FROM profiles
  WHERE id = moderator_id;

  -- Check permissions (admin or authority only)
  IF moderator_role NOT IN ('administrator', 'authority') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Insufficient permissions to assign strikes'
    );
  END IF;

  -- Get target user info
  SELECT role, strikes INTO target_user_role, current_strikes
  FROM profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;

  -- Prevent striking other admins unless you're an authority
  IF target_user_role IN ('administrator', 'authority') AND moderator_role != 'authority' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Cannot assign strikes to administrators'
    );
  END IF;

  -- Prevent self-striking
  IF p_user_id = moderator_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Cannot assign strikes to yourself'
    );
  END IF;

  -- Increment strikes
  new_strikes := current_strikes + 1;

  -- Auto-ban after 3 strikes
  IF new_strikes >= 3 THEN
    should_ban := true;
  END IF;

  -- Update user strikes and ban status
  UPDATE profiles
  SET strikes = new_strikes,
      is_banned = CASE WHEN should_ban THEN true ELSE is_banned END
  WHERE id = p_user_id;

  -- Send notification to user
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type
  ) VALUES (
    p_user_id,
    'Moderation Notice',
    CASE 
      WHEN should_ban THEN 
        'You have received your third strike and have been banned from the platform. Contact support if you believe this is an error.'
      ELSE 
        'You have received a strike (' || new_strikes || '/3) for violating community guidelines. Please review our terms of service.'
    END,
    'moderation'
  );

  -- Log the action
  PERFORM public.log_admin_action(
    p_user_id,
    'STRIKE_ASSIGNED',
    jsonb_build_object(
      'previous_strikes', current_strikes,
      'new_strikes', new_strikes,
      'auto_banned', should_ban,
      'moderator_role', moderator_role
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Strike assigned successfully',
    'user_id', p_user_id,
    'new_strikes', new_strikes,
    'auto_banned', should_ban
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error assigning strike: ' || SQLERRM
    );
END;
$$;

-- Function to send system notifications
CREATE OR REPLACE FUNCTION public.send_system_notification(
  p_user_id uuid,
  p_message text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_role text;
  notification_id uuid;
BEGIN
  -- Get sender role (if authenticated)
  IF auth.uid() IS NOT NULL THEN
    SELECT role INTO sender_role
    FROM profiles
    WHERE id = auth.uid();
  END IF;

  -- Validate user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Target user not found'
    );
  END IF;

  -- Insert notification
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    metadata
  )
  VALUES (
    p_user_id,
    'System Notification',
    p_message,
    'system',
    jsonb_build_object(
      'sender_role', COALESCE(sender_role, 'system'),
      'sent_at', now()
    )
  )
  RETURNING id INTO notification_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Notification sent successfully',
    'notification_id', notification_id,
    'user_id', p_user_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error sending notification: ' || SQLERRM
    );
END;
$$;

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

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable row level security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_codes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone including anonymous users"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile basic info"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin_or_authority())
  WITH CHECK (is_admin_or_authority());

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can delete any profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (is_admin_or_authority());

CREATE POLICY "Service role has full access to profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ideas policies
CREATE POLICY "Ideas are viewable by everyone including anonymous users"
  ON ideas FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create their own ideas"
  ON ideas FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id) AND 
    check_user_verified_and_not_banned() AND
    ((NOT COALESCE(is_official_proposal, false)) OR can_create_official_proposals())
  );

CREATE POLICY "Users can update their own ideas"
  ON ideas FOR UPDATE
  TO authenticated
  USING ((auth.uid() = user_id) AND check_user_verified_and_not_banned())
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Representatives can update official proposals"
  ON ideas FOR UPDATE
  TO authenticated
  USING (
    (is_official_proposal = true) AND 
    can_modify_official_proposals() AND 
    check_user_verified_and_not_banned()
  )
  WITH CHECK (can_modify_official_proposals());

CREATE POLICY "Admins can update any idea"
  ON ideas FOR UPDATE
  TO authenticated
  USING (is_admin_or_authority())
  WITH CHECK (is_admin_or_authority());

CREATE POLICY "Users can delete their own ideas"
  ON ideas FOR DELETE
  TO authenticated
  USING ((auth.uid() = user_id) AND check_user_verified_and_not_banned());

CREATE POLICY "Admins can delete any idea"
  ON ideas FOR DELETE
  TO authenticated
  USING (is_admin_or_authority());

-- Votes policies
CREATE POLICY "Users can view any vote"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote once per idea"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id) AND 
    check_user_verified_and_not_banned()
  );

CREATE POLICY "Users can update their own votes"
  ON votes FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = user_id) AND 
    check_user_verified_and_not_banned()
  )
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON votes FOR DELETE
  TO authenticated
  USING (
    (auth.uid() = user_id) AND 
    check_user_verified_and_not_banned()
  );

CREATE POLICY "Admins can manage any vote"
  ON votes FOR ALL
  TO authenticated
  USING (is_admin_or_authority())
  WITH CHECK (is_admin_or_authority());

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  TO authenticated
  USING (NOT is_removed);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id) AND 
    check_user_verified_and_not_banned()
  );

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = user_id) AND 
    check_user_verified_and_not_banned()
  )
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (
    (auth.uid() = user_id) AND 
    check_user_verified_and_not_banned()
  );

CREATE POLICY "Admins can manage any comment"
  ON comments FOR ALL
  TO authenticated
  USING (is_admin_or_authority())
  WITH CHECK (is_admin_or_authority());

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (is_admin_or_authority())
  WITH CHECK (is_admin_or_authority());

CREATE POLICY "Service role can manage notifications"
  ON notifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Audit log policies
CREATE POLICY "Admins and authorities can view audit log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (is_admin_or_authority());

CREATE POLICY "Service role has full access to audit log"
  ON audit_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admin audit log policies
CREATE POLICY "Admins can view audit log"
  ON admin_audit_log FOR SELECT
  TO authenticated
  USING (is_admin_or_authority());

-- Error codes policies
CREATE POLICY "Error codes are viewable by everyone"
  ON error_codes FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert error codes
INSERT INTO public.error_codes (code, message, http_status) VALUES
  ('AUTH.EMAIL_NOT_VERIFIED', 'Please verify your email address before continuing.', 403),
  ('AUTH.ACCESS_DENIED', 'You do not have permission to access this resource.', 403),
  ('SERVER.INTERNAL_ERROR', 'An internal server error occurred. Please try again later.', 500),
  ('AUTH.INVALID_CREDENTIALS', 'Invalid email or password.', 401),
  ('AUTH.EMAIL_IN_USE', 'This email is already registered.', 409)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions for all functions
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_authority() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_modify_official_proposals() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_create_official_proposals() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_verified_and_not_banned() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_user_email_confirmation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_email_confirmation(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_user_email_verified(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.force_email_verification(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_vote(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_vote_history(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_audit_log_entry(uuid, text, text, uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_current_actor_id() TO service_role;
GRANT EXECUTE ON FUNCTION public.audit_ideas_changes() TO service_role;
GRANT EXECUTE ON FUNCTION public.audit_profiles_changes() TO service_role;
GRANT EXECUTE ON FUNCTION public.audit_votes_changes() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_audit_logs(text, uuid, uuid, text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action(uuid, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_ban_user(uuid, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_change_user_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_user_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_strike(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_system_notification(uuid, text) TO authenticated;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

-- Add comments for tables
COMMENT ON TABLE public.profiles IS 'User profiles table with consolidated changes';
COMMENT ON TABLE public.ideas IS 'Core table for all user-generated content (proposals, complaints, votes)';
COMMENT ON TABLE public.votes IS 'Tracks user votes on ideas';
COMMENT ON TABLE public.comments IS 'User comments on ideas with moderation support';
COMMENT ON TABLE public.notifications IS 'System notifications for users';
COMMENT ON TABLE public.audit_log IS 'Comprehensive audit trail for all sensitive table changes';
COMMENT ON TABLE public.admin_audit_log IS 'Audit log for tracking administrative actions';
COMMENT ON TABLE public.error_codes IS 'Error codes and messages for consistent error handling';

-- Add comments for columns
COMMENT ON COLUMN public.profiles.email_confirmed_at IS 'Timestamp when user confirmed their email address - required for platform access';
COMMENT ON COLUMN public.profiles.role IS 'User role: user, representative, administrator, or authority';
COMMENT ON COLUMN public.profiles.strikes IS 'Number of moderation strikes against the user';
COMMENT ON COLUMN public.profiles.is_banned IS 'Whether the user is currently banned';

COMMENT ON COLUMN public.ideas.is_official_proposal IS 'Whether this is an official proposal from authorities';
COMMENT ON COLUMN public.ideas.voting_ends_at IS 'When the voting period ends for this idea';

COMMENT ON COLUMN public.comments.is_flagged IS 'Whether comment is flagged for review';
COMMENT ON COLUMN public.comments.is_removed IS 'Whether comment has been removed by moderator';
COMMENT ON COLUMN public.comments.moderated_by IS 'ID of moderator who took action';
COMMENT ON COLUMN public.comments.moderated_at IS 'Timestamp of moderation action';
COMMENT ON COLUMN public.comments.moderation_reason IS 'Reason for moderation action';

COMMENT ON COLUMN public.notifications.type IS 'Type of notification: system, moderation, info, warning, success';
COMMENT ON COLUMN public.notifications.is_read IS 'Whether user has read the notification';
COMMENT ON COLUMN public.notifications.expires_at IS 'When notification expires (NULL = never)';
COMMENT ON COLUMN public.notifications.metadata IS 'Additional notification data as JSON';

COMMENT ON COLUMN public.audit_log.actor_user_id IS 'User who performed the action (NULL for system actions)';
COMMENT ON COLUMN public.audit_log.action_type IS 'Type of action: INSERT, UPDATE, or DELETE';
COMMENT ON COLUMN public.audit_log.target_entity_type IS 'Table name that was modified';
COMMENT ON COLUMN public.audit_log.target_entity_id IS 'ID of the record that was modified';
COMMENT ON COLUMN public.audit_log.details IS 'JSON details of what changed';

-- Add comments for functions
COMMENT ON FUNCTION public.get_user_role() IS 'Returns the role of the current authenticated user';
COMMENT ON FUNCTION public.is_admin_or_authority() IS 'Checks if current user has administrator or authority role';
COMMENT ON FUNCTION public.can_modify_official_proposals() IS 'Checks if user can modify official proposals (representative+)';
COMMENT ON FUNCTION public.can_create_official_proposals() IS 'Checks if user can create official proposals (representative+)';
COMMENT ON FUNCTION public.check_user_verified_and_not_banned() IS 'Validates user has verified email and is not banned';
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates or updates a user profile when a new user is created';
COMMENT ON FUNCTION public.sync_user_email_confirmation(uuid) IS 'Syncs email confirmation status from auth.users to profiles';
COMMENT ON FUNCTION public.is_user_email_verified(uuid) IS 'Checks if a user has verified their email address';
COMMENT ON FUNCTION public.force_email_verification(uuid) IS 'Admin-only function to force email verification for a user';
COMMENT ON FUNCTION public.handle_anonymous_idea() IS 'Handles anonymous idea creation with secure search_path';
COMMENT ON FUNCTION public.update_vote_counts() IS 'Updates vote counts with secure search_path';
COMMENT ON FUNCTION public.increment_vote(uuid, text) IS 'Processes a vote with weekly limits and verification checks';
COMMENT ON FUNCTION public.get_user_vote_history(uuid) IS 'Gets a user vote history with idea details';
COMMENT ON FUNCTION public.create_audit_log_entry(uuid, text, text, uuid, jsonb) IS 'Creates audit log entries for tracking changes';
COMMENT ON FUNCTION public.get_current_actor_id() IS 'Gets current user ID for audit logging';
COMMENT ON FUNCTION public.audit_ideas_changes() IS 'Trigger function to audit ideas table changes';
COMMENT ON FUNCTION public.audit_profiles_changes() IS 'Trigger function to audit profiles table changes';
COMMENT ON FUNCTION public.audit_votes_changes() IS 'Trigger function to audit votes table changes';
COMMENT ON FUNCTION public.get_audit_logs(text, uuid, uuid, text, integer, integer) IS 'Gets filtered audit logs - Admin only';
COMMENT ON FUNCTION public.log_admin_action(uuid, text, jsonb) IS 'Logs administrative actions for audit trail';
COMMENT ON FUNCTION public.admin_ban_user(uuid, boolean, text) IS 'Admin function to ban/unban users with audit trail';
COMMENT ON FUNCTION public.admin_change_user_role(uuid, text) IS 'Admin function to change user roles with restrictions';
COMMENT ON FUNCTION public.admin_get_user_stats() IS 'Admin function to get platform statistics';
COMMENT ON FUNCTION public.assign_strike(uuid) IS 'Assigns moderation strike to user with potential auto-ban';
COMMENT ON FUNCTION public.send_system_notification(uuid, text) IS 'Sends system notification to user';
COMMENT ON FUNCTION auto_confirm_email() IS 'Automatically confirms emails for new users (for development only)';

-- Add comments for triggers
COMMENT ON TRIGGER audit_ideas_trigger ON public.ideas IS 'Audits all changes to ideas table';
COMMENT ON TRIGGER audit_profiles_trigger ON public.profiles IS 'Audits moderation-related changes to profiles table';
COMMENT ON TRIGGER audit_votes_trigger ON public.votes IS 'Audits all changes to votes table';
COMMENT ON TRIGGER on_vote_changed ON public.votes IS 'Updates idea vote counts when votes change';
COMMENT ON TRIGGER handle_anonymous_idea_trigger ON public.ideas IS 'Processes anonymous ideas appropriately';