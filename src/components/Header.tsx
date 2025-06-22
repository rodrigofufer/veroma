import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, User, LogOut, Home, PlusCircle, LayoutDashboard, Shield, Building2, Info, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import VotesDisplay from './VotesDisplay';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  
  const { user, signOut, role, loading: authLoading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setMenuOpen(false);
    
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/';
    } finally {
      setSigningOut(false);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const baseMenuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/new-idea', icon: PlusCircle, label: 'New Idea' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  const getRoleSpecificItems = () => {
    const items = [];
    if (role === 'administrator' || role === 'authority') {
      items.push({
        path: '/admin',
        icon: Shield,
        label: 'Admin Panel'
      });
    }
    if (role === 'representative') {
      items.push({
        path: '/new-idea?official=true',
        icon: Building2,
        label: 'Official Proposal'
      });
    }
    return items;
  };

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
          
          {user && !authLoading && (
            <nav className="hidden md:flex items-center space-x-4">
              {allMenuItems.map(({ path, icon: Icon, label }) => {
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
                      (label === 'Admin Panel') ? 'border border-red-200 hover:border-red-300' :
                      (label === 'Official Proposal') ? 'border border-purple-200 hover:border-purple-300' : ''
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Link>
                );
              })}
              
              <VotesDisplay />
              
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center transition-colors disabled:opacity-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {signingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </nav>
          )}

          {/* Mobile menu button */}
          {user && !authLoading && (
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && user && !authLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 bg-white"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {allMenuItems.map(({ path, icon: Icon, label }) => {
                  const isOfficialProposal = path.includes('official=true');
                  const linkPath = isOfficialProposal ? '/new-idea' : path;
                  const isActiveLink = isOfficialProposal ? 
                    (isActive('/new-idea') && new URLSearchParams(location.search).get('official') === 'true') :
                    isActive(path);

                  return (
                    <Link
                      key={path}
                      to={linkPath + (isOfficialProposal ? '?official=true' : '')}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-base font-medium flex items-center transition-colors ${
                        isActiveLink
                          ? 'text-blue-800 bg-blue-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      } ${
                        (label === 'Admin Panel') ? 'border border-red-200' :
                        (label === 'Official Proposal') ? 'border border-purple-200' : ''
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {label}
                    </Link>
                  );
                })}
                
                <div className="px-3 py-2">
                  <VotesDisplay />
                </div>
                
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  {signingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}