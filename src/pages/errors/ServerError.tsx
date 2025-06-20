import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ServerError() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img src="/logobk2.png" alt="Veroma" className="h-12 w-auto mx-auto mb-8" />
        
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 rounded-full p-4">
            <AlertTriangle className="h-12 w-12 text-yellow-600" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">500 – Internal Server Error</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Something went wrong on our end. We're working to fix it.
        </p>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors duration-200"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}