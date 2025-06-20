import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BoltBadge from './BoltBadge';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  showBackButton?: boolean;
}

export default function PageLayout({ children, title, icon, showBackButton = true }: PageLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow pt-24 pb-16 px-4">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex items-center mb-8">
                {icon}
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              </div>

              {children}

              {showBackButton && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Go Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
      <BoltBadge />
    </div>
  );
}