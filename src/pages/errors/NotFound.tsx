import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export default function NotFound() {
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
        
        <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page not found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, the page you're looking for doesn't exist.
        </p>
        
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-6 py-3 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors duration-200"
        >
          <Home className="w-5 h-5 mr-2" />
          Go to Homepage
        </button>
      </motion.div>
    </div>
  );
}