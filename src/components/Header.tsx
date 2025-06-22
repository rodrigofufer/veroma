import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, User, LogOut, Home, PlusCircle, LayoutDashboard, Shield, Building2, Info, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import VotesDisplay from './VotesDisplay';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { user, signOut, role, loading: authLoading } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    if (signingOut) return; // Prevent multiple clicks
    
    setSigningOut(true);
    setMenuOpen(false);
    
    try {
      await signOut();
      // Navigation is handled in the AuthContext
    } catch (error) {
      console.error('Sign out error:', error);
      // Force navigation to home page if sign out fails
      window.location.href = '/';
    } finally {
      setSigningOut(false);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Base menu items for all authenticated users
  const baseMenuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/new-idea', icon: PlusCircle, label: 'New Idea' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  // Role-specific menu items
  const getRoleSpecificItems = () => {
    const items = [];

    // Admin Dashboard for administrators and authorities
    if (role === 'administrator' || role === 'authority') {
      items.push({
        path: '/admin',
        icon: Shield,
        label: 'Admin Panel'
      });
    }

    // New Official Proposal for representatives
    if (role === 'representative') {
      items.push({
        path: '/new-idea?official=true',
        icon: Building2,
        label: 'Official Proposal'
      });
    }

    return items;
  };

  // Combine all menu items
  const allMenuItems = [...baseMenuItems, ...getRoleSpecificItems()];

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/logobk2.png" 
                alt="Veroma" 
                className="h-8 w-auto"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = '/logobk.png';
                }}
              />
            </Link>
          </div>
          
          {user && !loading && (
            <nav className="hidden md:flex items-center space-x-4">
              {allMenuItems.map(({ path, icon: Icon, label }) => {
                // Handle special case for official proposal link
                const isOfficialProposal = path.includes('official=true');
                const linkPath = isOfficialProposal ? '/new-idea' : path;
                const isActiveLink = isOfficialProposal ? 
                  (isActive('/new-idea') && new URLSearchParams(location.search).get('official') === 'true') :
                  isActive(path);

                return (
                  <Link 
                    key={path}
                    to={linkPath + (isOfficialProposal ? '?official=true' : '')}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                      isActiveLink
                        ? 'text-blue-800 bg-blue-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    } ${
                      // Special styling for role-specific items
                      (label === 'Admin Panel') ? 'border border-red-200 hover:border-red-300' :
                      (label === 'Official Proposal') ? 'border border-purple-200 hover:border-purple-300' :
                      ''
                    }`}
                  >
                    <Icon className={`h-4 w-4 mr-1.5 ${
                      label === 'Admin Panel' ? 'text-red-600' :
                      label === 'Official Proposal' ? 'text-purple-600' :
                      ''
                    }`} />
                    {label}
                  </Link>
                );
              })}
              
              {/* Add VotesDisplay here with margin-left */}
              <div className="ml-4">
                <VotesDisplay />
              </div>
            </nav>
          )}
          
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Role Badge */}
                {!authLoading && role !== 'user' && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                    role === 'authority' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                    role === 'administrator' ? 'bg-red-100 text-red-800 border-red-200' :
                    role === 'representative' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                    {role === 'authority' ? 'Authority' :
                     role === 'administrator' ? 'Administrator' :
                     role === 'representative' ? 'Representative' : role}
                  </span>
                )}
                
                <button 
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
                    signingOut 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  {signingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link 
                  to="/about"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center"
                >
                  <Info className="h-4 w-4 mr-1.5" />
                  About
                </Link>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-blue-800 hover:text-blue-900 transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            className="md:hidden bg-white shadow-lg border-t border-gray-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  {/* Add VotesDisplay here for mobile */}
                  <div className="px-3 py-2">
                    <VotesDisplay />
                  </div>

                  {/* Role Badge for Mobile */}
                  {!authLoading && role !== 'user' && (
                    <div className="px-3 py-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                        role === 'authority' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        role === 'administrator' ? 'bg-red-100 text-red-800 border-red-200' :
                        role === 'representative' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {role === 'authority' ? 'Authority' :
                         role === 'administrator' ? 'Administrator' :
                         role === 'representative' ? 'Representative' : role}
                      </span>
                    </div>
                  )}

                  {allMenuItems.map(({ path, icon: Icon, label }) => {
                    // Handle special case for official proposal link
                    const isOfficialProposal = path.includes('official=true');
                    const linkPath = isOfficialProposal ? '/new-idea' : path;
                    const isActiveLink = isOfficialProposal ? 
                      (isActive('/new-idea') && new URLSearchParams(location.search).get('official') === 'true') :
                      isActive(path);

                    return (
                      <Link 
                        key={path}
                        to={linkPath + (isOfficialProposal ? '?official=true' : '')}
                        className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          isActiveLink
                            ? 'bg-blue-50 text-blue-800' 
                            : 'text-gray-700 hover:bg-gray-50'
                        } ${
                          // Special styling for role-specific items
                          (label === 'Admin Panel') ? 'border-l-4 border-red-500' :
                          (label === 'Official Proposal') ? 'border-l-4 border-purple-500' :
                          ''
                        }`}
                        onClick={() => setMenuOpen(false)}
                      >
                        <Icon className={`h-5 w-5 mr-2 ${
                          label === 'Admin Panel' ? 'text-red-600' :
                          label === 'Official Proposal' ? 'text-purple-600' :
                          ''
                        }`} />
                        {label}
                        {/* Role indicator for mobile */}
                        {label === 'Admin Panel' && (
                          <span className="ml-auto text-xs text-red-600 font-medium">Admin</span>
                        )}
                        {label === 'Official Proposal' && (
                          <span className="ml-auto text-xs text-purple-600 font-medium">Rep</span>
                        )}
                      </Link>
                    );
                  })}
                  
                  <button 
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      signingOut 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    {signingOut ? 'Signing Out...' : 'Sign Out'}
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/about"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Info className="h-5 w-5 mr-2" />
                    About
                  </Link>
                  <Link 
                    to="/support"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    <HelpCircle className="h-5 w-5 mr-2" />
                    Help
                  </Link>
                  <Link 
                    to="/login" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-800 text-white hover:bg-blue-900 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}