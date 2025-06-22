import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, Loader, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured, syncEmailConfirmation } from '../utils/supabaseClient';
import toast from 'react-hot-toast'; 
import { useAuth } from '../contexts/AuthContext';

export default function SupabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const { user, refreshSession } = useAuth();

  const checkConnection = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setStatus('error');
      setErrorMessage('Supabase is not configured. Please check your .env file with correct credentials.');
      return;
    }

    try {
      setIsRetrying(true);
      // Try to make a simple query to check connection
      const { error } = await supabase.from('profiles').select('id').limit(1);
      
      if (error) {
        console.error('Supabase connection error:', error);
        setStatus('error');
        setErrorMessage(error.message);
        toast.error('Database connection error. Please check your environment configuration.');
      } else {
        setStatus('connected');
        console.log('Supabase connection successful');
        
        // If user exists, sync their email verification status
        if (user) {
          try {
            await syncEmailConfirmation(user.id);
            await refreshSession();
          } catch (syncError) {
            console.error('Error syncing user data:', syncError);
          }
        }
      }
    } catch (err) {
      console.error('Supabase connection check failed:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Database connection failed. Please check your environment configuration.');
    } finally {
      setIsRetrying(false);
    }
  }, [user, refreshSession]);
  useEffect(() => {

    checkConnection();
  }, [checkConnection]);

  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-white p-3 rounded-lg shadow-lg flex items-center space-x-2">
        <Loader className="h-5 w-5 text-blue-600 animate-spin mr-2" />
        <span className="text-sm text-gray-600">Checking database connection...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-red-50 p-4 rounded-lg shadow-lg border border-red-200 max-w-sm">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-sm font-medium text-red-800">Database connection error</span>
        </div>
        {errorMessage && (
          <div className="mt-1 text-xs text-red-600 max-w-xs">
            {errorMessage}
          </div>
        )}
        <div className="mt-2 flex justify-end">
          <button
            onClick={checkConnection}
            disabled={isRetrying}
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isRetrying ? (
              <Loader className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            )}
            Retry Connection
          </button>
        </div>
      </div>
    );
  }
}