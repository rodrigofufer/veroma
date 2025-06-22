-- Create a function to generate test user data
CREATE OR REPLACE FUNCTION generate_test_users(
  p_count INTEGER DEFAULT 10,
  p_representative_percentage INTEGER DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_representative_count INTEGER;
  v_user_count INTEGER;
  v_created_count INTEGER := 0;
  v_rep_created_count INTEGER := 0;
  v_user_created_count INTEGER := 0;
  v_current_user_role TEXT;
  v_user_id UUID;
  v_first_names TEXT[] := ARRAY['John', 'Maria', 'James', 'Carlos', 'Ana', 'Michael', 'Sofia', 'Robert', 'Emma', 'David', 'Linda', 'William', 'Patricia', 'Olivia', 'Daniel', 'Elizabeth', 'Thomas', 'Jennifer', 'Joseph', 'Susan'];
  v_last_names TEXT[] := ARRAY['Smith', 'Garcia', 'Johnson', 'Rodriguez', 'Brown', 'Martinez', 'Wilson', 'Lopez', 'Jones', 'Hernandez', 'Davis', 'Gonzalez', 'Miller', 'Perez', 'Taylor', 'Sanchez', 'Anderson', 'Rivera', 'Thomas', 'Ramirez'];
  v_countries TEXT[] := ARRAY['United States', 'Mexico', 'Canada', 'Brazil', 'United Kingdom', 'Spain', 'France', 'Germany', 'Italy', 'Japan'];
  v_first_name TEXT;
  v_last_name TEXT;
  v_country TEXT;
  v_email TEXT;
  v_role TEXT;
  v_i INTEGER;
BEGIN
  -- Check admin privileges
  SELECT role INTO v_current_user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  IF v_current_user_role NOT IN ('administrator', 'authority') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Only administrators can generate test users'
    );
  END IF;
  
  -- Calculate distribution
  v_representative_count := GREATEST(0, LEAST(p_count, FLOOR(p_count * p_representative_percentage / 100)::INTEGER));
  v_user_count := p_count - v_representative_count;
  
  -- Create regular users
  FOR v_i IN 1..v_user_count LOOP
    -- Generate random data
    v_first_name := v_first_names[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_first_names, 1))::INTEGER];
    v_last_name := v_last_names[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_last_names, 1))::INTEGER];
    v_country := v_countries[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_countries, 1))::INTEGER];
    v_email := LOWER(v_first_name || '.' || v_last_name || '_' || v_i || '_test@example.com');
    v_role := 'user';
    
    -- Create the user
    v_user_id := gen_random_uuid();
    
    -- Insert directly into auth.users with confirmed email
    INSERT INTO auth.users (
      id, 
      email,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      last_sign_in_at
    )
    VALUES (
      v_user_id,
      v_email,
      NOW(),
      jsonb_build_object(
        'name', v_first_name,
        'lastname', v_last_name,
        'country', v_country
      ),
      NOW(),
      NOW(),
      NULL
    );
    
    -- Create the profile
    INSERT INTO public.profiles (
      id,
      email,
      name,
      lastname,
      country,
      role,
      email_confirmed_at,
      votes_remaining,
      votes_reset_at,
      weekly_vote_limit,
      strikes,
      is_banned
    )
    VALUES (
      v_user_id,
      v_email,
      v_first_name,
      v_last_name,
      v_country,
      v_role,
      NOW(),
      10,
      date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week')),
      10,
      0,
      false
    );
    
    v_created_count := v_created_count + 1;
    v_user_created_count := v_user_created_count + 1;
  END LOOP;
  
  -- Create representatives
  FOR v_i IN 1..v_representative_count LOOP
    -- Generate random data
    v_first_name := v_first_names[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_first_names, 1))::INTEGER];
    v_last_name := v_last_names[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_last_names, 1))::INTEGER];
    v_country := v_countries[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_countries, 1))::INTEGER];
    v_email := LOWER('rep.' || v_first_name || '.' || v_last_name || '_' || v_i || '_test@example.com');
    v_role := 'representative';
    
    -- Create the user
    v_user_id := gen_random_uuid();
    
    -- Insert directly into auth.users with confirmed email
    INSERT INTO auth.users (
      id, 
      email,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      last_sign_in_at
    )
    VALUES (
      v_user_id,
      v_email,
      NOW(),
      jsonb_build_object(
        'name', v_first_name,
        'lastname', v_last_name,
        'country', v_country
      ),
      NOW(),
      NOW(),
      NULL
    );
    
    -- Create the profile
    INSERT INTO public.profiles (
      id,
      email,
      name,
      lastname,
      country,
      role,
      email_confirmed_at,
      votes_remaining,
      votes_reset_at,
      weekly_vote_limit,
      strikes,
      is_banned
    )
    VALUES (
      v_user_id,
      v_email,
      v_first_name,
      v_last_name,
      v_country,
      v_role,
      NOW(),
      10,
      date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week')),
      10,
      0,
      false
    );
    
    v_created_count := v_created_count + 1;
    v_rep_created_count := v_rep_created_count + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Test users generated successfully',
    'total_created', v_created_count,
    'users_created', v_user_created_count,
    'representatives_created', v_rep_created_count,
    'percent_representatives', p_representative_percentage
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'An error occurred while generating test users'
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION generate_test_users(INTEGER, INTEGER) TO authenticated;

-- Add documentation
COMMENT ON FUNCTION generate_test_users(INTEGER, INTEGER) IS 'Admin function to generate test users with verified emails (for development and testing)';

-- Create a function to generate test idea data
CREATE OR REPLACE FUNCTION generate_test_ideas(
  p_count_per_user INTEGER DEFAULT 3
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_record RECORD;
  v_idea_id UUID;
  v_created_count INTEGER := 0;
  v_current_user_role TEXT;
  v_idea_types TEXT[] := ARRAY['complaint', 'proposal', 'vote'];
  v_categories TEXT[] := ARRAY['infraestructura', 'salud', 'seguridad', 'educacion', 'ambiente', 'transporte', 'cultura', 'economia', 'otro'];
  v_location_levels TEXT[] := ARRAY['ciudad', 'estado', 'pais', 'global'];
  v_cities TEXT[] := ARRAY['New York', 'London', 'Paris', 'Tokyo', 'Berlin', 'Madrid', 'Rome', 'Mexico City', 'Toronto', 'Sydney'];
  v_title_templates TEXT[] := ARRAY[
    'Improve [service] in [location]',
    'Fix the [issue] at [location]',
    'New [facility] needed in [location]',
    'Proposal for better [service] in [location]',
    'Vote on [topic] for [location]',
    'Community [event] for [location]',
    'Address [problem] in [location]',
    'Enhance [area] safety in [location]',
    'Develop [project] for [location]',
    'Support [initiative] in [location]'
  ];
  v_description_templates TEXT[] := ARRAY[
    'This [type] aims to address the ongoing issues with [service] in [location]. The current situation is problematic and requires attention.',
    'There is a significant [issue] in [location] that needs to be fixed. This [type] outlines the problems and potential solutions.',
    '[location] needs a new [facility] to improve quality of life. This [type] explains the benefits and potential implementation.',
    'This [type] is about enhancing [service] in [location]. Current services are inadequate and could be significantly improved.',
    'We need to collectively decide on [topic] for [location]. This [type] presents the options and seeks community input.',
    'A [event] would greatly benefit the community in [location]. This [type] outlines the plan and expected outcomes.',
    'The [problem] in [location] has been ongoing and requires immediate attention. This [type] details the situation and possible solutions.',
    'Safety in [area] of [location] is a concern. This [type] proposes measures to improve security for all residents.',
    'A new [project] could transform [location] positively. This [type] presents the concept and implementation plan.',
    'The [initiative] in [location] needs community support. This [type] explains why and how residents can help.'
  ];
  v_title TEXT;
  v_description TEXT;
  v_type TEXT;
  v_category TEXT;
  v_location_level TEXT;
  v_location_value TEXT;
  v_country TEXT;
  v_is_anonymous BOOLEAN;
  v_is_official BOOLEAN;
  v_voting_ends_at TIMESTAMP WITH TIME ZONE;
  v_i INTEGER;
  v_template_index INTEGER;
BEGIN
  -- Check admin privileges
  SELECT role INTO v_current_user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  IF v_current_user_role NOT IN ('administrator', 'authority') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Only administrators can generate test ideas'
    );
  END IF;
  
  -- Iterate through all users
  FOR v_user_record IN 
    SELECT id, role, country, email FROM public.profiles
  LOOP
    -- Generate ideas for each user
    FOR v_i IN 1..p_count_per_user LOOP
      -- Generate random data
      v_type := v_idea_types[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_idea_types, 1))::INTEGER];
      v_category := v_categories[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_categories, 1))::INTEGER];
      v_location_level := v_location_levels[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_location_levels, 1))::INTEGER];
      v_location_value := v_cities[1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_cities, 1))::INTEGER];
      v_country := v_user_record.country;
      v_is_anonymous := RANDOM() < 0.3; -- 30% chance of anonymous
      
      -- For representatives, some ideas should be official proposals
      IF v_user_record.role IN ('representative', 'administrator', 'authority') AND RANDOM() < 0.4 THEN
        v_is_official := TRUE;
        -- Set a voting deadline for official proposals
        v_voting_ends_at := NOW() + (FLOOR(RANDOM() * 60) + 5)::INTEGER * INTERVAL '1 day';
      ELSE
        v_is_official := FALSE;
        v_voting_ends_at := NULL;
      END IF;
      
      -- Generate title and description from templates
      v_template_index := 1 + FLOOR(RANDOM() * ARRAY_LENGTH(v_title_templates, 1))::INTEGER;
      v_title := REPLACE(REPLACE(REPLACE(v_title_templates[v_template_index], '[service]', 
        CASE v_category
          WHEN 'infraestructura' THEN 'infrastructure'
          WHEN 'salud' THEN 'healthcare'
          WHEN 'seguridad' THEN 'security'
          WHEN 'educacion' THEN 'education'
          WHEN 'ambiente' THEN 'environmental protection'
          WHEN 'transporte' THEN 'transportation'
          WHEN 'cultura' THEN 'cultural services'
          WHEN 'economia' THEN 'economic support'
          ELSE 'community services'
        END), '[issue]',
        CASE v_category
          WHEN 'infraestructura' THEN 'roads'
          WHEN 'salud' THEN 'clinic hours'
          WHEN 'seguridad' THEN 'street lighting'
          WHEN 'educacion' THEN 'school facilities'
          WHEN 'ambiente' THEN 'waste management'
          WHEN 'transporte' THEN 'bus routes'
          WHEN 'cultura' THEN 'community center'
          WHEN 'economia' THEN 'local business support'
          ELSE 'public services'
        END), '[location]', v_location_value);
      
      -- Description with more substitutions
      v_description := REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(v_description_templates[v_template_index],
        '[type]', v_type),
        '[service]', 
        CASE v_category
          WHEN 'infraestructura' THEN 'infrastructure'
          WHEN 'salud' THEN 'healthcare'
          WHEN 'seguridad' THEN 'security'
          WHEN 'educacion' THEN 'education'
          WHEN 'ambiente' THEN 'environmental protection'
          WHEN 'transporte' THEN 'transportation'
          WHEN 'cultura' THEN 'cultural services'
          WHEN 'economia' THEN 'economic support'
          ELSE 'community services'
        END),
        '[issue]',
        CASE v_category
          WHEN 'infraestructura' THEN 'pothole problem'
          WHEN 'salud' THEN 'clinic waiting times'
          WHEN 'seguridad' THEN 'inadequate street lighting'
          WHEN 'educacion' THEN 'outdated school facilities'
          WHEN 'ambiente' THEN 'inefficient waste management'
          WHEN 'transporte' THEN 'inconvenient bus routes'
          WHEN 'cultura' THEN 'lack of community spaces'
          WHEN 'economia' THEN 'insufficient local business support'
          ELSE 'gap in public services'
        END),
        '[location]', v_location_value),
        '[topic]', 
        CASE v_category
          WHEN 'infraestructura' THEN 'infrastructure budget allocation'
          WHEN 'salud' THEN 'new medical facility location'
          WHEN 'seguridad' THEN 'community policing strategy'
          WHEN 'educacion' THEN 'school curriculum changes'
          WHEN 'ambiente' THEN 'green space development'
          WHEN 'transporte' THEN 'public transit expansion'
          WHEN 'cultura' THEN 'cultural festival planning'
          WHEN 'economia' THEN 'small business incentives'
          ELSE 'community priorities'
        END);

      -- Add more details to description
      v_description := v_description || E'\n\n' || 
        CASE WHEN v_is_official THEN 'This is an official proposal that requires community input. ' ELSE '' END ||
        'Submitted by a ' || 
        CASE 
          WHEN v_is_anonymous THEN 'concerned citizen' 
          WHEN v_user_record.role = 'representative' THEN 'community representative'
          WHEN v_user_record.role = 'administrator' THEN 'platform administrator'
          WHEN v_user_record.role = 'authority' THEN 'local authority'
          ELSE 'community member'
        END || 
        ' who wants to see positive change in ' || v_location_value || '.';

      -- Create the idea
      INSERT INTO public.ideas (
        title,
        description,
        type,
        location,
        country,
        user_id,
        is_anonymous,
        location_value,
        location_level,
        category,
        is_official_proposal,
        voting_ends_at,
        created_at
      )
      VALUES (
        v_title,
        v_description,
        v_type,
        v_location_value,
        v_country,
        v_user_record.id,
        v_is_anonymous,
        v_location_value,
        v_location_level,
        v_category,
        v_is_official,
        v_voting_ends_at,
        NOW() - (FLOOR(RANDOM() * 30))::INTEGER * INTERVAL '1 day' -- Random date in the last 30 days
      )
      RETURNING id INTO v_idea_id;
      
      v_created_count := v_created_count + 1;
    END LOOP;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Test ideas generated successfully',
    'ideas_created', v_created_count
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'An error occurred while generating test ideas'
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION generate_test_ideas(INTEGER) TO authenticated;

-- Add documentation
COMMENT ON FUNCTION generate_test_ideas(INTEGER) IS 'Admin function to generate test ideas for each user (for development and testing)';

-- Function to generate test votes
CREATE OR REPLACE FUNCTION generate_test_votes(
  p_votes_per_idea INTEGER DEFAULT 5
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_record RECORD;
  v_idea_record RECORD;
  v_vote_type TEXT;
  v_created_count INTEGER := 0;
  v_current_user_role TEXT;
  v_i INTEGER;
  v_ideas_array UUID[];
  v_idea_index INTEGER;
  v_ideas_count INTEGER;
  v_voter_id UUID;
  v_users_array UUID[];
  v_users_count INTEGER;
BEGIN
  -- Check admin privileges
  SELECT role INTO v_current_user_role
  FROM public.profiles 
  WHERE id = auth.uid();

  IF v_current_user_role NOT IN ('administrator', 'authority') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Only administrators can generate test votes'
    );
  END IF;
  
  -- Get all idea IDs
  SELECT ARRAY_AGG(id) INTO v_ideas_array FROM public.ideas;
  v_ideas_count := ARRAY_LENGTH(v_ideas_array, 1);
  
  -- Get all user IDs
  SELECT ARRAY_AGG(id) INTO v_users_array FROM public.profiles;
  v_users_count := ARRAY_LENGTH(v_users_array, 1);
  
  -- Exit if no ideas or users
  IF v_ideas_count IS NULL OR v_users_count IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'No ideas or users found to generate votes'
    );
  END IF;
  
  -- Generate votes for each idea
  FOR v_i IN 1..v_ideas_count LOOP
    -- Select the idea
    SELECT * INTO v_idea_record FROM public.ideas WHERE id = v_ideas_array[v_i];
    
    -- Generate random votes for this idea
    FOR v_j IN 1..p_votes_per_idea LOOP
      -- Select a random user (who is not the idea creator)
      v_voter_id := NULL;
      WHILE v_voter_id IS NULL OR v_voter_id = v_idea_record.user_id LOOP
        v_voter_id := v_users_array[1 + FLOOR(RANDOM() * v_users_count)::INTEGER];
      END LOOP;
      
      -- Determine vote type (70% upvotes, 30% downvotes)
      IF RANDOM() < 0.7 THEN
        v_vote_type := 'up';
      ELSE
        v_vote_type := 'down';
      END IF;
      
      -- Create vote if it doesn't already exist
      IF NOT EXISTS (
        SELECT 1 FROM public.votes 
        WHERE user_id = v_voter_id AND idea_id = v_idea_record.id
      ) THEN
        INSERT INTO public.votes (
          user_id,
          idea_id,
          vote_type,
          voted_at
        )
        VALUES (
          v_voter_id,
          v_idea_record.id,
          v_vote_type,
          NOW() - (FLOOR(RANDOM() * 14))::INTEGER * INTERVAL '1 day' -- Random date in the last 14 days
        )
        ON CONFLICT (idea_id, user_id) DO NOTHING;
        
        v_created_count := v_created_count + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Test votes generated successfully',
    'votes_created', v_created_count
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'An error occurred while generating test votes'
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION generate_test_votes(INTEGER) TO authenticated;

-- Add documentation
COMMENT ON FUNCTION generate_test_votes(INTEGER) IS 'Admin function to generate test votes for existing ideas (for development and testing)';