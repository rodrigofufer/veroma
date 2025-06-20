/*
  # Create moderation system with RPC functions
  
  1. New Tables
    - `comments` table for user comments on ideas
    - `notifications` table for system notifications
  
  2. RPC Functions
    - moderate_comment(comment_id UUID, action TEXT)
    - assign_strike(p_user_id UUID)
    - ban_user(p_user_id UUID)
    - send_system_notification(p_user_id UUID, p_message TEXT)
  
  3. Security
    - All functions are SECURITY DEFINER with search_path set to public
    - Proper role-based access control
    - Audit trail for all moderation actions
*/

-- ============================================================================
-- CREATE REQUIRED TABLES
-- ============================================================================

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_flagged boolean NOT NULL DEFAULT false,
  is_removed boolean NOT NULL DEFAULT false,
  moderated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderated_at timestamptz,
  moderation_reason text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'system' CHECK (type IN ('system', 'moderation', 'info', 'warning', 'success')),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz,
  metadata jsonb
);

-- Enable RLS on new tables
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON public.comments (idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments (user_id);
CREATE INDEX IF NOT EXISTS idx_comments_is_flagged ON public.comments (is_flagged);
CREATE INDEX IF NOT EXISTS idx_comments_is_removed ON public.comments (is_removed);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments (created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications (is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications (type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications (expires_at);

-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  TO authenticated
  USING (NOT is_removed);

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    public.check_user_verified_and_not_banned()
  );

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND 
    public.check_user_verified_and_not_banned()
  )
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id AND 
    public.check_user_verified_and_not_banned()
  );

CREATE POLICY "Admins can manage any comment"
  ON public.comments FOR ALL
  TO authenticated
  USING (public.is_admin_or_authority())
  WITH CHECK (public.is_admin_or_authority());

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage notifications"
  ON public.notifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (public.is_admin_or_authority())
  WITH CHECK (public.is_admin_or_authority());

-- ============================================================================
-- MODERATION RPC FUNCTIONS
-- ============================================================================

-- Function to moderate comments
CREATE OR REPLACE FUNCTION public.moderate_comment(
  comment_id uuid,
  action text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  moderator_role text;
  moderator_id uuid;
  comment_record record;
  comment_author_id uuid;
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
      'message', 'Insufficient permissions to moderate comments'
    );
  END IF;

  -- Validate action
  IF action NOT IN ('flag', 'unflag', 'remove', 'restore') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid moderation action. Must be: flag, unflag, remove, or restore'
    );
  END IF;

  -- Get comment details
  SELECT * INTO comment_record
  FROM comments
  WHERE id = comment_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Comment not found'
    );
  END IF;

  comment_author_id := comment_record.user_id;

  -- Apply moderation action
  CASE action
    WHEN 'flag' THEN
      UPDATE comments
      SET is_flagged = true,
          moderated_by = moderator_id,
          moderated_at = now(),
          moderation_reason = 'Flagged for review'
      WHERE id = comment_id;

    WHEN 'unflag' THEN
      UPDATE comments
      SET is_flagged = false,
          moderated_by = moderator_id,
          moderated_at = now(),
          moderation_reason = 'Flag removed'
      WHERE id = comment_id;

    WHEN 'remove' THEN
      UPDATE comments
      SET is_removed = true,
          moderated_by = moderator_id,
          moderated_at = now(),
          moderation_reason = 'Comment removed by moderator'
      WHERE id = comment_id;

      -- Notify user about comment removal
      PERFORM public.send_system_notification(
        comment_author_id,
        'Your comment has been removed by a moderator for violating community guidelines.'
      );

    WHEN 'restore' THEN
      UPDATE comments
      SET is_removed = false,
          moderated_by = moderator_id,
          moderated_at = now(),
          moderation_reason = 'Comment restored'
      WHERE id = comment_id;

      -- Notify user about comment restoration
      PERFORM public.send_system_notification(
        comment_author_id,
        'Your comment has been restored after review.'
      );
  END CASE;

  -- Log the moderation action
  PERFORM public.log_admin_action(
    comment_author_id,
    'COMMENT_MODERATED',
    jsonb_build_object(
      'comment_id', comment_id,
      'action', action,
      'moderator_role', moderator_role
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Comment moderation action completed successfully',
    'action', action,
    'comment_id', comment_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error during comment moderation: ' || SQLERRM
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
  PERFORM public.send_system_notification(
    p_user_id,
    CASE 
      WHEN should_ban THEN 
        'You have received your ' || new_strikes || ' strike and have been banned from the platform. Contact support if you believe this is an error.'
      ELSE 
        'You have received a strike (' || new_strikes || '/3) for violating community guidelines. Please review our terms of service.'
    END
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

-- Function to ban users
CREATE OR REPLACE FUNCTION public.ban_user(
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
      'message', 'Insufficient permissions to ban users'
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

  -- Prevent banning other admins unless you're an authority
  IF target_user_role IN ('administrator', 'authority') AND moderator_role != 'authority' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Cannot ban administrators'
    );
  END IF;

  -- Prevent self-banning
  IF p_user_id = moderator_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Cannot ban yourself'
    );
  END IF;

  -- Ban the user and increment strikes
  UPDATE profiles
  SET is_banned = true,
      strikes = strikes + 1
  WHERE id = p_user_id;

  -- Send notification to user
  PERFORM public.send_system_notification(
    p_user_id,
    'Your account has been banned for violating community guidelines. Contact support if you believe this is an error.'
  );

  -- Log the action
  PERFORM public.log_admin_action(
    p_user_id,
    'USER_BANNED',
    jsonb_build_object(
      'previous_strikes', current_strikes,
      'moderator_role', moderator_role,
      'ban_reason', 'Manual ban by moderator'
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User banned successfully',
    'user_id', p_user_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error banning user: ' || SQLERRM
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

-- ============================================================================
-- UTILITY FUNCTIONS FOR NOTIFICATIONS
-- ============================================================================

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(
  notification_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update notification if user owns it
  UPDATE notifications
  SET is_read = true
  WHERE id = notification_id 
    AND user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Notification not found or access denied'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Notification marked as read'
  );
END;
$$;

-- Function to get user notifications
CREATE OR REPLACE FUNCTION public.get_user_notifications(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  message text,
  type text,
  is_read boolean,
  created_at timestamptz,
  metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.is_read,
    n.created_at,
    n.metadata
  FROM notifications n
  WHERE n.user_id = auth.uid()
    AND (n.expires_at IS NULL OR n.expires_at > now())
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL 
    AND expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions to service_role for all functions
GRANT EXECUTE ON FUNCTION public.moderate_comment(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.assign_strike(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.ban_user(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.send_system_notification(uuid, text) TO service_role;

-- Grant execute permissions to authenticated users for specific functions
GRANT EXECUTE ON FUNCTION public.mark_notification_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_notifications(integer, integer) TO authenticated;

-- Grant execute permissions to admins for moderation functions
-- Note: These functions already check permissions internally, but we grant to authenticated
-- so they can be called from the client with proper role validation
GRANT EXECUTE ON FUNCTION public.moderate_comment(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_strike(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ban_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_system_notification(uuid, text) TO authenticated;

-- Grant cleanup function to service_role only
GRANT EXECUTE ON FUNCTION public.cleanup_expired_notifications() TO service_role;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

-- Add comments for documentation
COMMENT ON TABLE public.comments IS 'User comments on ideas with moderation support';
COMMENT ON TABLE public.notifications IS 'System notifications for users';

COMMENT ON FUNCTION public.moderate_comment(uuid, text) IS 'Moderates comments (flag/unflag/remove/restore) - Admin only';
COMMENT ON FUNCTION public.assign_strike(uuid) IS 'Assigns moderation strike to user - Admin only';
COMMENT ON FUNCTION public.ban_user(uuid) IS 'Bans user from platform - Admin only';
COMMENT ON FUNCTION public.send_system_notification(uuid, text) IS 'Sends system notification to user';
COMMENT ON FUNCTION public.mark_notification_read(uuid) IS 'Marks notification as read by user';
COMMENT ON FUNCTION public.get_user_notifications(integer, integer) IS 'Gets paginated notifications for current user';
COMMENT ON FUNCTION public.cleanup_expired_notifications() IS 'Removes expired notifications - Service role only';

-- Add column comments
COMMENT ON COLUMN public.comments.is_flagged IS 'Whether comment is flagged for review';
COMMENT ON COLUMN public.comments.is_removed IS 'Whether comment has been removed by moderator';
COMMENT ON COLUMN public.comments.moderated_by IS 'ID of moderator who took action';
COMMENT ON COLUMN public.comments.moderated_at IS 'Timestamp of moderation action';
COMMENT ON COLUMN public.comments.moderation_reason IS 'Reason for moderation action';

COMMENT ON COLUMN public.notifications.type IS 'Type of notification: system, moderation, info, warning, success';
COMMENT ON COLUMN public.notifications.is_read IS 'Whether user has read the notification';
COMMENT ON COLUMN public.notifications.expires_at IS 'When notification expires (NULL = never)';
COMMENT ON COLUMN public.notifications.metadata IS 'Additional notification data as JSON';