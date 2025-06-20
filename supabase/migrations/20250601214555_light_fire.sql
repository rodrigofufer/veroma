-- Add voting-related columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS votes_remaining INTEGER NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS votes_reset_at TIMESTAMPTZ NOT NULL DEFAULT date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week'));

-- Update handle_new_user function to initialize voting fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    country,
    email_confirmed_at,
    votes_remaining,
    votes_reset_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'country',
    NEW.email_confirmed_at,
    10,
    date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week'))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to process votes with weekly limits
CREATE OR REPLACE FUNCTION public.rpc_process_user_vote(
  p_idea_id UUID,
  p_vote_type TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_votes_remaining INTEGER;
  v_votes_reset_at TIMESTAMPTZ;
  v_existing_vote RECORD;
  v_updated_votes_remaining INTEGER;
BEGIN
  -- Get user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not authenticated',
      'votes_remaining', 0
    );
  END IF;

  -- Get user's voting status
  SELECT votes_remaining, votes_reset_at
  INTO v_votes_remaining, v_votes_reset_at
  FROM public.profiles
  WHERE id = v_user_id;

  -- Check for vote reset
  IF current_timestamp AT TIME ZONE 'UTC' >= v_votes_reset_at THEN
    UPDATE public.profiles
    SET votes_remaining = 10,
        votes_reset_at = date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week'))
    WHERE id = v_user_id
    RETURNING votes_remaining INTO v_votes_remaining;
  END IF;

  -- Check remaining votes
  IF v_votes_remaining <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Has alcanzado el límite de votos esta semana.',
      'votes_remaining', 0
    );
  END IF;

  -- Check for existing vote
  SELECT * INTO v_existing_vote
  FROM public.votes
  WHERE user_id = v_user_id AND idea_id = p_idea_id;

  -- Process vote
  IF v_existing_vote.id IS NOT NULL THEN
    IF v_existing_vote.vote_type = p_vote_type THEN
      -- Unvoting
      DELETE FROM public.votes
      WHERE id = v_existing_vote.id;
      
      -- Return vote to user
      UPDATE public.profiles
      SET votes_remaining = votes_remaining + 1
      WHERE id = v_user_id
      RETURNING votes_remaining INTO v_updated_votes_remaining;
    ELSE
      -- Changing vote type
      UPDATE public.votes
      SET vote_type = p_vote_type,
          voted_at = now()
      WHERE id = v_existing_vote.id;
      
      -- No need to update votes_remaining as it's just changing the vote type
      v_updated_votes_remaining := v_votes_remaining;
    END IF;
  ELSE
    -- New vote
    INSERT INTO public.votes (user_id, idea_id, vote_type)
    VALUES (v_user_id, p_idea_id, p_vote_type);
    
    -- Decrement votes_remaining
    UPDATE public.profiles
    SET votes_remaining = votes_remaining - 1
    WHERE id = v_user_id
    RETURNING votes_remaining INTO v_updated_votes_remaining;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Voto registrado.',
    'votes_remaining', v_updated_votes_remaining
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error processing vote: ' || SQLERRM,
      'votes_remaining', v_votes_remaining
    );
END;
$$;

-- Create function to get user's vote status
CREATE OR REPLACE FUNCTION public.rpc_get_user_vote_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_votes_remaining INTEGER;
  v_votes_reset_at TIMESTAMPTZ;
BEGIN
  -- Get user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not authenticated'
    );
  END IF;

  -- Get current status
  SELECT votes_remaining, votes_reset_at
  INTO v_votes_remaining, v_votes_reset_at
  FROM public.profiles
  WHERE id = v_user_id;

  -- Check for reset
  IF current_timestamp AT TIME ZONE 'UTC' >= v_votes_reset_at THEN
    UPDATE public.profiles
    SET votes_remaining = 10,
        votes_reset_at = date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week'))
    WHERE id = v_user_id
    RETURNING votes_remaining, votes_reset_at
    INTO v_votes_remaining, v_votes_reset_at;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'votes_remaining', v_votes_remaining,
    'votes_reset_at', v_votes_reset_at
  );
END;
$$;