-- Set search_path for all SECURITY DEFINER functions
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.sync_email_confirmation() SET search_path = public;
ALTER FUNCTION public.handle_anonymous_idea() SET search_path = public;
ALTER FUNCTION public.update_vote_counts() SET search_path = public;
ALTER FUNCTION public.increment_vote(uuid, text) SET search_path = public;
ALTER FUNCTION public.get_user_vote_history(uuid) SET search_path = public;
ALTER FUNCTION public.get_public_stats() SET search_path = public;

-- Add comment to document the security enhancement
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a new user profile with secure search_path';
COMMENT ON FUNCTION public.sync_email_confirmation() IS 'Syncs email confirmation status with secure search_path';
COMMENT ON FUNCTION public.handle_anonymous_idea() IS 'Handles anonymous idea creation with secure search_path';
COMMENT ON FUNCTION public.update_vote_counts() IS 'Updates vote counts with secure search_path';
COMMENT ON FUNCTION public.increment_vote(uuid, text) IS 'Increments vote count with secure search_path';
COMMENT ON FUNCTION public.get_user_vote_history(uuid) IS 'Gets user vote history with secure search_path';
COMMENT ON FUNCTION public.get_public_stats() IS 'Gets public statistics with secure search_path';