import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, checkUserProfileExists, createProfileIfNeeded } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
  role: string | null;
  signUp: (data: { email: string; password: string; options?: { data: any } }) => Promise<void>;
  signIn: (data: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (data: { name?: string; country?: string }) => Promise<void>;
  resendVerificationEmail: (email?: string) => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  // Helper to fetch user role from profiles table
  const fetchUserRole = async (userId: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'user';
      }

      return data?.role || 'user';
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      return 'user';
    }
  };

  // Function to sync email verification status
  const syncEmailVerification = async (currentUser: User | null) => {
    if (!currentUser) {
      setEmailVerified(false);
      return;
    }

    try {
      // Check if email is confirmed in auth.users
      const isVerifiedInAuth = !!currentUser.email_confirmed_at;
      
      if (isVerifiedInAuth) {
        try {
          // Update profiles table to match auth.users using the sync function
          const { error: syncError } = await supabase.rpc('sync_user_email_confirmation', {
            user_id: currentUser.id
          });

          if (syncError) {
            console.error('Error syncing email confirmation:', syncError);
          }
        } catch (syncErr) {
          console.error('Error calling sync function:', syncErr);
        }
      }

      setEmailVerified(isVerifiedInAuth);
    } catch (error) {
      console.error('Error syncing email verification:', error);
      setEmailVerified(false);
    }
  };

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      setLoading(true);
      
      // Force refresh the session
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        setUser(null);
        setEmailVerified(false);
        return;
      }
      
      if (data.session) {
        setUser(data.session.user);
        await syncEmailVerification(data.session.user);
        const r = await fetchUserRole(data.session.user.id);
        setRole(r);
      } else {
        setUser(null);
        setEmailVerified(false);
        setRole(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setUser(null);
      setEmailVerified(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            // Check if user profile exists
            const profileExists = await checkUserProfileExists(session.user.id);
            
            if (!profileExists) {
              console.log('Profile does not exist, creating...');
              await createProfileIfNeeded(session.user.id, {
                email: session.user.email,
                name: session.user.user_metadata?.name || 'User',
                country: session.user.user_metadata?.country || 'Unknown'
              });
            }
            
            setUser(session.user);
            await syncEmailVerification(session.user);
            const r = await fetchUserRole(session.user.id);
            setRole(r);
          } else {
            setUser(null);
            setEmailVerified(false);
            setRole(null);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setEmailVerified(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email_confirmed_at);
      
      if (mounted) {
        if (session?.user) {
          // Check if user profile exists
          const profileExists = await checkUserProfileExists(session.user.id);
          
          if (!profileExists) {
            console.log('Profile does not exist during auth change, creating...');
            await createProfileIfNeeded(session.user.id, {
              email: session.user.email,
              name: session.user.user_metadata?.name || 'User',
              country: session.user.user_metadata?.country || 'Unknown'
            });
          }
          
          setUser(session.user);
          await syncEmailVerification(session.user);
          const r = await fetchUserRole(session.user.id);
          setRole(r);
        } else {
          setUser(null);
          setEmailVerified(false);
          setRole(null);
        }
        
        setLoading(false);
      }
      
      switch (event) {
        case 'SIGNED_IN':
          // Check if email is verified
          if (session?.user?.email_confirmed_at) {
            setEmailVerified(true);
            if (session?.user) {
              const r = await fetchUserRole(session.user.id);
              setRole(r);
            }
            toast.success('Welcome back!');
            navigate('/dashboard');
          } else {
            setEmailVerified(false);
            toast.error('Please verify your email address to continue');
            navigate('/verify-email', {
              state: {
                email: session?.user?.email,
                message: 'Please verify your email address to access all features.'
              }
            });
          }
          break;
        case 'SIGNED_OUT':
          setEmailVerified(false);
          setUser(null);
          setRole(null);
          navigate('/');
          break;
        case 'PASSWORD_RECOVERY':
          navigate('/reset-password');
          break;
        case 'TOKEN_REFRESHED':
          // Re-sync email verification status when token is refreshed
          if (mounted && session?.user) {
            await syncEmailVerification(session.user);
            const r = await fetchUserRole(session.user.id);
            setRole(r);
          }
          break;
        case 'USER_UPDATED':
          if (mounted && session?.user) {
            setUser(session.user);
            await syncEmailVerification(session.user);
            const r = await fetchUserRole(session.user.id);
            setRole(r);
          }
          break;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signUp = async (data: { email: string; password: string; options?: { data: any } }) => {
    try {
      console.log('Starting signup process for:', data.email);
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: data.options?.data,
          emailRedirectTo: `${window.location.origin}/email-confirmed`
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      console.log('Signup successful:', authData);

      // Check if user was created or already exists
      if (authData.user && !authData.user.email_confirmed_at) {
        toast.success('Please check your email to verify your account');
        navigate('/verify-email', { 
          state: { 
            email: data.email,
            message: 'We sent you a verification email. Please check your inbox and click the link to activate your account.'
          }
        });
      } else if (authData.user && authData.user.email_confirmed_at) {
        toast.success('Account created successfully!');
        navigate('/dashboard');
      } else {
        toast.success('Please check your email to verify your account');
        navigate('/verify-email', { 
          state: { 
            email: data.email,
            message: 'We sent you a verification email. Please check your inbox and click the link to activate your account.'
          }
        });
      }
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('User already registered')) {
        toast.error('This email is already registered. Please try signing in instead.');
      } else if (error.message?.includes('Invalid email')) {
        toast.error('Please enter a valid email address.');
      } else if (error.message?.includes('Password')) {
        toast.error('Password must be at least 6 characters long.');
      } else {
        toast.error(error.message || 'An error occurred during registration');
      }
      
      throw error;
    }
  };

  const signIn = async (data: { email: string; password: string }) => {
    try {
      console.log('Starting signin process for:', data.email);
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      
      if (error) {
        console.error('Signin error:', error);
        
        if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email address before signing in');
          navigate('/verify-email', { 
            state: { 
              email: data.email,
              message: 'Your email address is not verified. Please check your inbox for the verification email.'
            }
          });
          return;
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else {
          toast.error(error.message);
        }
        throw error;
      }

      console.log('Signin successful:', authData);
      
      // Success handling is done in the auth state change listener
      // But we'll add a fallback navigation here
      if (authData.user?.email_confirmed_at) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Signin error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset instructions sent to your email');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      toast.success('Password updated successfully. Please sign in with your new password.');
      await signOut();
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const updateProfile = async (data: { name?: string; country?: string }) => {
    try {
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const resendVerificationEmail = async (email?: string) => {
    try {
      // Use provided email or current user's email
      const targetEmail = email || user?.email;
      
      if (!targetEmail) {
        throw new Error('No email address found. Please try signing up again.');
      }

      console.log('Resending verification email to:', targetEmail);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmed`
        }
      });

      if (error) {
        console.error('Error resending:', error);
        throw error;
      }
      
      toast.success('Verification email sent successfully');
    } catch (error: any) {
      console.error('Error in resendVerificationEmail:', error);
      toast.error(error.message || 'Error sending verification email');
      throw error;
    }
  };

  const checkEmailVerification = async () => {
    try {
      // Refresh the session to get the latest user data
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user?.email_confirmed_at) {
        // Sync with profiles table
        await syncEmailVerification(session.user);
        setEmailVerified(true);
        setUser(session.user);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error checking email verification:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error from Supabase:', error);
        // Continue with cleanup even if there's an error
      }
      
      // Clear local state
      setUser(null);
      setEmailVerified(false);
      setRole(null);
      
      // Clear any cached data
      localStorage.removeItem('veroma-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      toast.success('Signed out successfully');
      
      // Force redirect to home page
      window.location.href = '/';
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error during sign out:', error);
      
      // Force cleanup even if there's an error
      setUser(null);
      setEmailVerified(false);
      setRole(null);
      localStorage.removeItem('veroma-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      toast.error('Error signing out, but you have been logged out');
      window.location.href = '/';
      
      return Promise.reject(error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      loading,
      emailVerified,
      role,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      resendVerificationEmail,
      checkEmailVerification,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};