import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Home } from 'lucide-react';

export default function AccessDenied() {
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
          <div className="bg-red-100 rounded-full p-4">
            <Shield className="h-12 w-12 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-9xl font-bold text-gray-200 mb-4">403</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Access denied</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          You don't have permission to view this page.
        </p>
        
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-6 py-3 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors duration-200"
        >
          <Home className="w-5 h-5 mr-2" />
          Back to Home
        </button>
      </motion.div>
    </div>
  );
}