import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables in Node.js
if (typeof process !== 'undefined' && process.env) {
  dotenv.config();
}

const getEnvVar = (key: string): string => {
  if (typeof window !== 'undefined' && import.meta?.env) {
    return import.meta.env[key] || '';
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Debug logging to verify environment variables
console.log("Supabase URL Loaded:", supabaseUrl);
console.log("Supabase Anon Key Loaded:", supabaseAnonKey ? "Yes, key is present." : "No, key is MISSING.");

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

const createMockClient = () => {
  // Mock client for when Supabase is not configured
  const mockAuth = {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    resetPasswordForEmail: () => Promise.resolve({ data: {}, error: { message: 'Supabase not configured' } }),
    updateUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
    refreshSession: () => Promise.resolve({ data: { session: null }, error: { message: 'Supabase not configured' } }),
    resend: () => Promise.resolve({ data: {}, error: { message: 'Supabase not configured' } }),
    verifyOtp: () => Promise.resolve({ data: { session: null, user: null }, error: { message: 'Supabase not configured' } })
  };
  
  const mockFrom = (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } })
        })
      })
    }),
    insert: (values: any) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    update: (values: any) => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    }),
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    })
  });
  
  const mockRpc = (fn: string, params?: any) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } });
  
  return { 
    auth: mockAuth, 
    from: mockFrom,
    rpc: mockRpc
  };
};

export const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      `Missing Supabase environment variables. Using mock client. Please check your .env file.`
    );
    return createMockClient() as any;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
})();

// Helper functions
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
    console.error('Error in checkUserProfileExists:', error);
    return false;
  }
};

export const createProfileIfNeeded = async (userId: string, userData: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        email: userData.email,
        name: userData.name || 'User',
        country: userData.country || 'Unknown'
      }]);
    
    if (error) {
      console.error('Error creating profile:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in createProfileIfNeeded:', error);
    return false;
  }
};

// Function to sync email confirmation status
export const syncEmailConfirmation = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('sync_user_email_confirmation', {
      user_id: userId
    });
    
    if (error) {
      console.error('Error syncing email confirmation:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in syncEmailConfirmation:', error);
    return false;
  }
};

// Function to get public stats
export const fetchPublicStats = async () => {
  try {
    const { data, error } = await supabase.rpc('get_public_stats');
    
    if (error) {
      console.error('Error fetching public stats:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchPublicStats:', error);
    return null;
  }
};