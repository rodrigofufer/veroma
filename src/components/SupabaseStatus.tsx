import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Database, X } from 'lucide-react';
import { isSupabaseConfigured } from '../utils/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupabaseStatus() {
  const isConfigured = isSupabaseConfigured();
  const [showStatus, setShowStatus] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  // Auto-hide the status after 10 seconds if configured
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
          className={`fixed bottom-4 left-4 z-50 rounded-lg text-sm flex items-center transition-all duration-300 ${
            isCollapsed 
              ? 'bg-green-100 border border-green-300 text-green-800 px-3 py-2'
              : 'bg-green-100 border border-green-300 text-green-800 px-4 py-3 shadow-md'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          {isCollapsed ? (
            <span>Base de datos conectada</span>
          ) : (
            <div>
              <div className="font-medium flex items-center justify-between">
                <span>Conexión a Supabase establecida</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStatus(false);
                  }}
                  className="ml-3 text-green-700 hover:text-green-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs mt-1">
                La aplicación está conectada correctamente a la base de datos
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed bottom-4 left-4 z-50 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg shadow-md max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-red-600" />
            <div className="font-medium">Base de datos no configurada</div>
          </div>
          <button 
            onClick={() => setShowStatus(false)}
            className="ml-3 text-red-700 hover:text-red-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="text-xs mt-2 ml-7">
          <p className="mb-1">Configure las variables de entorno en el archivo .env:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>VITE_SUPABASE_URL</li>
            <li>VITE_SUPABASE_ANON_KEY</li>
          </ul>
          <div className="mt-2 flex items-center text-xs text-red-700">
            <Database className="h-3 w-3 mr-1" />
            <span>Sin conexión a la base de datos, algunas funciones no estarán disponibles</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}