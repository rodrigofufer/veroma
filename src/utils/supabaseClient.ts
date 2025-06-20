import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file in Node.js environment
if (typeof process !== 'undefined' && process.env) {
  dotenv.config();
}

// Handle both browser (Vite) and Node.js environments
const getEnvVar = (key: string): string => {
  // In browser/Vite environment
  if (typeof window !== 'undefined' && import.meta?.env) {
    return import.meta.env[key] || '';
  }
  // In Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  // Log a warning instead of throwing to avoid breaking the UI when
  // environment variables are not provided. Supabase functionality
  // will simply be disabled in this case.
  console.warn(
    `Missing Supabase environment variables:\n` +
    `  URL: ${supabaseUrl ? 'defined' : 'missing'}\n` +
    `  Key: ${supabaseAnonKey ? 'defined' : 'missing'}`
  );
}

// Get the current domain, handling development and production environments
const getCurrentDomain = () => {
  // Only available in browser environment
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}`;
  }
  // Fallback for Node.js environment
  return 'http://localhost:5173';
};

// Configure storage based on environment
const getStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return undefined;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: typeof window !== 'undefined',
    flowType: 'pkce',
    storage: getStorage(),
    storageKey: 'veroma-auth-token',
    debug: getEnvVar('NODE_ENV') === 'development'
  },
  global: {
    headers: {
      'x-application-name': 'veroma'
    }
  },
  // Add retryable error codes
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  }
});

// Add error handling and retry logic - only in browser environment
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      console.log('Auth token refreshed successfully');
    }
    
    if (event === 'SIGNED_OUT') {
      console.log('User signed out');
      // Clear any cached data
      localStorage.removeItem('veroma-auth-token');
    }
  });
}

// Centralized email redirect configuration
export const getEmailSettings = () => {
  const baseUrl = getCurrentDomain();
  const redirectUrl = `${baseUrl}/verify-email`;
  
  return {
    emailRedirectTo: redirectUrl,
    redirectTo: redirectUrl,
    data: {
      redirectUrl,
      emailRedirectTo: redirectUrl,
      redirectTo: redirectUrl
    }
  };
};

// Helper function to handle auth errors
export const handleAuthError = (error: any) => {
  if (error.message.includes('Email link is invalid or has expired')) {
    return 'The verification link has expired. Please request a new one.';
  }
  if (error.message.includes('User already registered')) {
    return 'This email is already registered. Please try logging in.';
  }
  if (error.message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (error.message.includes('Email not confirmed')) {
    return 'Please verify your email before logging in.';
  }
  return error.message || 'An error occurred during authentication.';
};

// Session recovery helper
export const recoverSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Session recovery failed:', error);
    return null;
  }
};

// Public stats fetching function
export const fetchPublicStats = async () => {
  try {
    const { data, error } = await supabase.rpc('get_public_stats');
    
    if (error) {
      console.error('Error fetching public stats:', error);
      throw error;
    }
    
    return {
      totalIdeas: data?.totalIdeas || 0,
      totalUsers: data?.totalUsers || 0,
      totalCountries: data?.totalCountries || 0
    };
  } catch (error) {
    console.error('Error fetching public stats:', error);
    return {
      totalIdeas: 0,
      totalUsers: 0,
      totalCountries: 0
    };
  }
};

// Function to check if a user exists in the profiles table
export const checkUserProfileExists = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking profile:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking if profile exists:', error);
    return false;
  }
};

// Function to create a profile if it doesn't exist
export const createProfileIfNeeded = async (userId: string, userData: any): Promise<boolean> => {
  try {
    const profileExists = await checkUserProfileExists(userId);
    
    if (!profileExists) {
      console.log('Creating profile for user:', userId);
      
      const { error } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email: userData.email,
          name: userData.name || 'User',
          lastname: userData.lastname || '',
          country: userData.country || 'Unknown',
          role: 'user',
          votes_remaining: 10,
          votes_reset_at: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
          weekly_vote_limit: 10,
          email_confirmed_at: new Date().toISOString() // Auto-confirm for simplicity
        }]);
      
      if (error) {
        console.error('Error creating profile:', error);
        return false;
      }
      
      console.log('Profile created successfully');
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error in createProfileIfNeeded:', error);
    return false;
  }
};