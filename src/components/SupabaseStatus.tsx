import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Database, X, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../utils/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupabaseStatus() {
  const isConfigured = isSupabaseConfigured();
  const [showStatus, setShowStatus] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Auto-collapse status after 5 seconds if configured
  useEffect(() => {
    if (isConfigured) {
      const timer = setTimeout(() => {
        setIsCollapsed(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isConfigured]);
  
  if (!showStatus) return null;

  if (isConfigured) {
    return (
      <AnimatePresence>
        <motion.div 
          className={`fixed bottom-4 left-4 z-50 rounded-lg text-sm transition-all duration-300 ${
            isCollapsed 
              ? 'bg-green-100 border border-green-300 text-green-800 shadow-sm'
              : 'bg-white border border-green-300 shadow-md'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div 
            className={`flex items-center cursor-pointer ${isCollapsed ? 'px-3 py-2' : 'px-4 py-3 border-b border-green-100'}`}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div className="flex items-center flex-grow">
              <div className="bg-green-100 p-1.5 rounded-full mr-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <span className="font-medium">Database connected</span>
            </div>
            <button className="ml-2 text-green-700 hover:text-green-900">
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowStatus(false);
              }}
              className="ml-1 text-green-700 hover:text-green-900"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 py-3 text-gray-700"
              >
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Database className="h-3.5 w-3.5 mr-2 text-green-600" />
                    <span className="text-xs">Supabase connected successfully</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    All application features are available
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed bottom-4 left-4 z-50 bg-white border border-red-300 rounded-lg shadow-md max-w-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <div className="bg-red-50 px-4 py-3 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-red-100 p-1.5 rounded-full mr-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div className="font-medium text-red-800">Database not configured</div>
            </div>
            <button 
              onClick={() => setShowStatus(false)}
              className="text-red-700 hover:text-red-900"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-white">
          <div className="text-sm text-gray-700 space-y-3">
            <p>To connect the database, set the environment variables in the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env</code> file:</p>
            <div className="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-xs">
              <div className="text-blue-700">VITE_SUPABASE_URL=<span className="text-gray-500">your_supabase_url</span></div>
              <div className="text-blue-700">VITE_SUPABASE_ANON_KEY=<span className="text-gray-500">your_anon_key</span></div>
            </div>
            <div className="flex items-center text-xs text-red-600 bg-red-50 p-2 rounded">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span>Without database connection, most features will not be available</span>
            </div>
            <a 
              href="https://supabase.com/docs/guides/getting-started/quickstarts/reactjs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Supabase documentation
            </a>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}