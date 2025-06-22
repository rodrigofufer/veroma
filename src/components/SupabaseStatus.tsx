import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../utils/supabaseClient';
import toast from 'react-hot-toast';

export default function SupabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const checkConnection = useCallback(async () => {
    try {
      setIsRetrying(true);
      setStatus('checking');
      
      if (!isSupabaseConfigured()) {
        setStatus('error');
        setErrorMessage('Supabase is not configured. Please check your .env file with correct credentials.');
        setIsVisible(true);
        return;
      }

      // Try to make a simple query to check connection
      const { error } = await supabase.from('error_codes').select('code').limit(1);
      
      if (error) {
        console.error('Supabase connection error:', error);
        setStatus('error');
        setErrorMessage(error.message);
        setIsVisible(true);
      } else {
        setStatus('connected');
        setIsVisible(false);
      }
    } catch (err) {
      console.error('Supabase connection check failed:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      setIsVisible(true);
    } finally {
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Don't render anything when connected
  if (status === 'connected' || !isVisible) {
    return null;
  }

  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-gray-700 bg-opacity-80 p-3 rounded-lg shadow-lg flex items-center space-x-2">
        <RefreshCw className="h-4 w-4 text-white animate-spin" />
        <span className="text-xs text-white">Checking connection...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-red-50 p-3 rounded-lg shadow-lg border border-red-200 max-w-xs">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-sm font-medium text-red-800">Database connection error</span>
          <button 
            onClick={() => setIsVisible(false)} 
            className="ml-auto -mr-1.5 text-red-400 hover:text-red-600"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {errorMessage && (
          <div className="mt-1 text-xs text-red-600 max-w-xs overflow-hidden text-ellipsis">
            {errorMessage}
          </div>
        )}
        <div className="mt-2 flex justify-between">
          <div className="text-xs text-red-600">Check your .env file</div>
          <button
            onClick={checkConnection}
            disabled={isRetrying}
            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50"
          >
            {isRetrying ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            )}
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return null;
}