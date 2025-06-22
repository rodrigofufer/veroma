import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import {
  supabase,
  checkUserProfileExists,
  createProfileIfNeeded,
  isSupabaseConfigured,
  syncEmailConfirmation
} from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
  role: string | null;
  signUp: (
    data: {
      email: string;
      password: string;
      options?: { data: Record<string, unknown> };
    }
  ) => Promise<void>;
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

  const syncEmailVerification = async (currentUser: User | null) => {
    if (!currentUser) {
      setEmailVerified(false);
      return;
    }

    try {
      const isVerifiedInAuth = !!currentUser.email_confirmed_at;
      
      if (isVerifiedInAuth) {
        try {
          await syncEmailConfirmation(currentUser.id);
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
  
  const refreshSession = async () => {
    try {
      setLoading(true);
      console.log('Refreshing auth session...');
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
        try {
          const r = await fetchUserRole(data.session.user.id);
          setRole(r);
        } catch (roleError) {
          console.error('Error fetching user role:', roleError);
          setRole('user'); // Default role if fetch fails
        }
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
    
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
          email: data.email.trim(),
          password: data.password
            const profileExists = await checkUserProfileExists(session.user.id);
            if (!profileExists) {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (session?.user) {
          const profileExists = await checkUserProfileExists(session.user.id);
          if (!profileExists) {
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
                message: 'Please verify your email to access all features.'
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
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (data: { email: string; password: string }) => {
    if (!isSupabaseConfigured()) {
      const errorMessage = 'Supabase connection is not configured.';
      console.error(errorMessage);
      toast.error('Server configuration error.');
      throw new Error(errorMessage);
    }
    
    try {
      // Clear any previous auth toasts
      toast.dismiss('auth-signin');
      toast.loading('Signing in...', { id: 'auth-signin', duration: 30000 });
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        console.error('Error in Supabase login:', error);
        // Make sure to dismiss the loading toast
        toast.dismiss('auth-signin'); 
        
        let friendlyMessage;
        if (error.message.includes('Email not confirmed')) {
          friendlyMessage = 'Your email is not verified. Please check your inbox.';
          navigate('/verify-email', { 
            state: { 
              email: data.email,
              message: 'Your email is not verified. Please check your inbox and click the verification link.'
            }
          });
        } else if (error.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Invalid email or password. Please try again.';
        } else {
          friendlyMessage = 'Login failed: ' + error.message;
        }
        toast.error(friendlyMessage, { id: 'auth-error' });
        throw new Error(friendlyMessage);
      }
    } catch (error) {
      console.error('Error in signIn function:', error);
      throw error;
    }
  };
  
  const signUp = async (data: {email: string; password: string; options?: { data: Record<string, unknown> };}) => {
    try {
        if (!isSupabaseConfigured()) {
            toast.error('Supabase connection is not configured.');
            console.error('Supabase connection not configured. Check .env file.');
            throw new Error('Supabase not configured');
        }

        // Clear any previous errors
        setError(null);
        toast.loading('Creating your account...', { id: 'signup' });

        const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: data.options?.data,
                emailRedirectTo: `${window.location.origin}/email-confirmed`
            }
        });
        if (error) throw error;
        if (authData.user) {
            toast.success('Please check your email to verify your account', { id: 'signup' });
            navigate('/verify-email', { 
                state: { 
                    email: data.email,
                    message: 'We sent you a verification email. Please check your inbox and click the link to activate your account.'
                }
            });
        }
    } catch (error: any) {
        console.error('Signup error:', error);
        toast.error(error.message || 'An error occurred during registration', { id: 'signup' });
        throw error;
    }
  };

  const signOut = async () => {
    try {
        toast.loading('Signing out...', { id: 'signout' });
        await supabase.auth.signOut();
        setUser(null);
        setEmailVerified(false);
        setRole(null);
        document.cookie = 'veroma_session=; Max-Age=0; path=/; SameSite=Lax';
        toast.success('Signed out successfully', { id: 'signout' });
        window.location.href = '/';
    } catch (error: any) {
        console.error('Error during sign out:', error);
        toast.error('Error signing out, but you have been logged out', { id: 'signout' });
        window.location.href = '/';
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
        const targetEmail = email || user?.email;
        if (!targetEmail) {
            throw new Error('No email address found.');
        }
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: targetEmail,
            options: {
                emailRedirectTo: `${window.location.origin}/email-confirmed`
            }
        });
        if (error) throw error;
        toast.success('Verification email sent successfully');
    } catch (error: any) {
        console.error('Error in resendVerificationEmail:', error);
        toast.error(error.message || 'Error sending verification email');
        throw error;
    }
  };

  const checkEmailVerification = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user?.email_confirmed_at) {
            await syncEmailVerification(session.user);
            setEmailVerified(true);
            setUser(session.user);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking email verification:', error);
        throw error;
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