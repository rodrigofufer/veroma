import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import toast from 'react-hot-toast';

export default function SupabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (!isSupabaseConfigured()) {
        setStatus('error');
        setErrorMessage('Supabase is not configured. Please check your .env file.');
        return;
      }

      try {
        // Try to make a simple query to check connection
        const { error } = await supabase.from('profiles').select('id').limit(1);
        
        if (error) {
          console.error('Supabase connection error:', error);
          setStatus('error');
          setErrorMessage(error.message);
          toast.error('Database connection error. Please check console for details.');
        } else {
          setStatus('connected');
          console.log('Supabase connection successful');
        }
      } catch (err) {
        console.error('Supabase connection check failed:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
        toast.error('Database connection failed. Please check console for details.');
      }
    };

    checkConnection();
  }, []);

  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-white p-3 rounded-lg shadow-lg flex items-center">
        <Loader className="h-5 w-5 text-blue-600 animate-spin mr-2" />
        <span className="text-sm text-gray-600">Checking database connection...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-red-50 p-3 rounded-lg shadow-lg border border-red-200">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-sm font-medium text-red-800">Database connection error</span>
        </div>
        {errorMessage && (
          <div className="mt-1 text-xs text-red-600 max-w-xs">
            {errorMessage}
          </div>
        )}
      </div>
    );
  }

  // Return null when connected to avoid UI clutter
  return null;
}