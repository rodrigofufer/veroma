import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { isSupabaseConfigured, supabase, testSupabaseConnection } from '../utils/supabaseClient';
import toast from 'react-hot-toast';

export default function SupabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState<any>(null);

  const checkConnection = useCallback(async () => {
    try {
      setIsRetrying(true);
      setStatus('checking');
      
      console.log('Checking Supabase configuration...');
      
      if (!isSupabaseConfigured()) {
        setStatus('error');
        setErrorMessage('Supabase is not configured. Please check your environment variables.');
        setIsVisible(true);
        return;
      }

      console.log('Testing Supabase connection...');
      const connectionTest = await testSupabaseConnection();
      
      if (!connectionTest) {
        setStatus('error');
        setErrorMessage('Cannot connect to Supabase. Please check your configuration.');
        setIsVisible(true);
        return;
      }

      // Additional auth test
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Auth session check:', { hasSession: !!session, error: sessionError });
        
        setConnectionDetails({
          hasSession: !!session,
          sessionError: sessionError?.message
        });
      } catch (authError) {
        console.error('Auth test error:', authError);
      }

      setStatus('connected');
      setIsVisible(false);
      console.log('Supabase connection successful');
      
    } catch (err) {
      console.error('Supabase connection check failed:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Unknown connection error');
      setIsVisible(true);
    } finally {
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Don't render anything when connected
  if (status === 'connected' && !isVisible) {
    return null;
  }

  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-blue-600 bg-opacity-90 p-3 rounded-lg shadow-lg flex items-center space-x-2">
        <RefreshCw className="h-4 w-4 text-white animate-spin" />
        <span className="text-xs text-white">Checking connection...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-red-50 p-4 rounded-lg shadow-lg border border-red-200 max-w-sm">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-medium text-red-800">Database Connection Error</span>
            <button 
              onClick={() => setIsVisible(false)} 
              className="ml-auto -mr-1.5 text-red-400 hover:text-red-600 float-right"
            >
              <span className="sr-only">Close</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {errorMessage && (
          <div className="mt-2 text-xs text-red-600 break-words">
            {errorMessage}
          </div>
        )}
        
        <div className="mt-3 flex flex-col space-y-2">
          <div className="text-xs text-red-600">
            <strong>Troubleshooting:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Check your .env file exists</li>
              <li>Verify VITE_SUPABASE_URL is set</li>
              <li>Verify VITE_SUPABASE_ANON_KEY is set</li>
              <li>Restart the development server</li>
            </ul>
          </div>
          
          <button
            onClick={checkConnection}
            disabled={isRetrying}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50 transition-colors"
          >
            {isRetrying ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            )}
            Retry Connection
          </button>
        </div>
        
        {connectionDetails && (
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <strong>Debug Info:</strong>
            <pre className="mt-1 text-xs overflow-x-auto">
              {JSON.stringify(connectionDetails, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  return null;
}