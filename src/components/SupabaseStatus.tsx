import React from 'react';
import { AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { isSupabaseConfigured } from '../utils/supabaseClient';

export default function SupabaseStatus() {
  const isConfigured = isSupabaseConfigured();
  
  if (isConfigured) {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-green-100 border border-green-300 text-green-800 px-3 py-2 rounded-lg text-sm flex items-center">
        <CheckCircle className="h-4 w-4 mr-2" />
        Supabase Connected
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded-lg text-sm flex items-center max-w-sm">
      <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
      <div>
        <div className="font-medium">Supabase Not Configured</div>
        <div className="text-xs mt-1">
          Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file
        </div>
      </div>
    </div>
  );
}