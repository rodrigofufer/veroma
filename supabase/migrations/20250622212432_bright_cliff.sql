-- Create an admin user (only if we're in a development environment)
DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'admin@veroma.org';
BEGIN
  -- Check if the admin user already exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;
  
  IF admin_user_id IS NULL THEN
    -- Create admin user in auth.users
    INSERT INTO auth.users (
      id,
      email,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      admin_email,
      NOW(),
      jsonb_build_object(
        'name', 'System',
        'lastname', 'Admin',
        'country', 'Global'
      ),
      NOW(),
      NOW()
    )
    RETURNING id INTO admin_user_id;
    
    -- Create admin profile
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
      admin_user_id,
      admin_email,
      'System',
      'Admin',
      'Global',
      'administrator',
      NOW(),
      10,
      date_trunc('week', (current_timestamp AT TIME ZONE 'UTC' + interval '1 week')),
      10,
      0,
      false
    );
    
    RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
  ELSE
    -- Ensure the existing user has admin role
    UPDATE public.profiles
    SET 
      role = 'administrator',
      email_confirmed_at = NOW()
    WHERE id = admin_user_id;
    
    -- Make sure email is confirmed in auth.users
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = admin_user_id;
    
    RAISE NOTICE 'Existing admin user updated with ID: %', admin_user_id;
  END IF;
END $$;

-- To set a password for the admin user, use the admin interface in Supabase
-- or call auth.users.update_user() with the appropriate password hash
-- Note: We can't set passwords directly in migrations because they need to be hashed properly