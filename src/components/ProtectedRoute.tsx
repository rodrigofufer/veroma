import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const { data, error, status } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (error && status !== 406) {
          console.error('Error checking profile:', error);
        }

        setProfileExists(!!data);
      } catch (error) {
        console.error('Error in profile check:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    if (!authLoading) {
      checkProfile();
    }
  }, [user, authLoading]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-800 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    toast.error('Please log in to access this page');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profileExists) {
    // Handle case where user exists in auth but not in profiles table
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Profile Error</h2>
          <p className="text-gray-700 mb-6">
            There was a problem loading your profile. This can happen if your account was created but the profile wasn't properly initialized.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/signup';
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign Out and Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}