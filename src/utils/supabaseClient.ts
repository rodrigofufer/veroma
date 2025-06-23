import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  const configured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '');
  console.log('Supabase configuration check:', {
    hasUrl: Boolean(supabaseUrl),
    hasKey: Boolean(supabaseAnonKey),
    urlLength: supabaseUrl.length,
    keyLength: supabaseAnonKey.length,
    configured
  });
  return configured;
};

// Create Supabase client with better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'veroma-web'
    }
  }
});

// Test connection function
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('error_codes').select('code').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

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
        lastname: userData.lastname || '',
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