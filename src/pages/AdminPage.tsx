import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';
import { motion } from 'framer-motion';
import { 
  Users, 
  Database, 
  Settings, 
  RefreshCw, 
  Shield, 
  UserPlus, 
  Loader, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateTestUsers } from '../utils/generateTestUsers';

export default function AdminPage() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [userCount, setUserCount] = useState<number>(0);
  const [citizenCount, setCitizenCount] = useState<number>(0);
  const [representativeCount, setRepresentativeCount] = useState<number>(0);
  const [numUsers, setNumUsers] = useState<number>(20);
  const [repPercentage, setRepPercentage] = useState<number>(10);

  useEffect(() => {
    const checkRoleAndLoad = async () => {
      if (authLoading) return;

      if (!user) {
        navigate('/login');
        return;
      }

      if (role !== 'administrator' && role !== 'authority') {
        toast.error('Access denied. Administrator privileges required.');
        navigate('/dashboard');
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      await fetchStats();
      setLoading(false);
    };

    checkRoleAndLoad();
  }, [user, role, authLoading, navigate]);

  const fetchStats = async () => {
    try {
      // Get user counts
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      const { count: citizenUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user');
      
      const { count: repUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'representative');
      
      setUserCount(totalUsers || 0);
      setCitizenCount(citizenUsers || 0);
      setRepresentativeCount(repUsers || 0);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleGenerateUsers = async () => {
    if (generating) return;
    
    setGenerating(true);
    setGenerationResult(null);
    
    try {
      toast.loading('Generating test users...', { id: 'generating' });
      
      const result = await generateTestUsers(numUsers, repPercentage);
      
      setGenerationResult(result);
      
      if (result.success) {
        toast.success(`Generated ${result.stats.total} users successfully!`, { id: 'generating' });
      } else {
        toast.error(`Error generating users: ${result.message}`, { id: 'generating' });
      }
      
      await fetchStats();
    } catch (error) {
      console.error('Error generating users:', error);
      toast.error('Failed to generate test users', { id: 'generating' });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-blue-800 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading admin panel...</p>
          </div>
        </div>
        <Footer />
        <BoltBadge />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
        <Footer />
        <BoltBadge />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Shield className="h-8 w-8 text-blue-800 mr-3" />
                  Test User Generator
                </h1>
                <p className="text-gray-600 mt-2">
                  Generate test users for development and testing purposes
                </p>
              </div>
              <button
                onClick={fetchStats}
                className="flex items-center px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Stats
              </button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Total Users</h3>
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{userCount}</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Citizens</h3>
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{citizenCount}</div>
              <div className="text-sm text-gray-500 mt-1">
                {userCount > 0 ? Math.round((citizenCount / userCount) * 100) : 0}% of users
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Representatives</h3>
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{representativeCount}</div>
              <div className="text-sm text-gray-500 mt-1">
                {userCount > 0 ? Math.round((representativeCount / userCount) * 100) : 0}% of users
              </div>
            </div>
          </motion.div>

          {/* Generator Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8"
          >
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <div className="flex items-center">
                <UserPlus className="h-6 w-6 text-blue-800 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Generate Test Users</h2>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="numUsers" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Users to Generate
                  </label>
                  <input
                    id="numUsers"
                    type="number"
                    min="1"
                    max="50"
                    value={numUsers}
                    onChange={(e) => setNumUsers(parseInt(e.target.value) || 20)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended: 20 users or fewer per batch to avoid rate limits
                  </p>
                </div>

                <div>
                  <label htmlFor="repPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                    Percentage of Representatives
                  </label>
                  <div className="flex items-center">
                    <input
                      id="repPercentage"
                      type="range"
                      min="0"
                      max="100"
                      value={repPercentage}
                      onChange={(e) => setRepPercentage(parseInt(e.target.value))}
                      className="w-full mr-4"
                    />
                    <span className="text-lg font-medium text-gray-900 w-12 text-center">
                      {repPercentage}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {Math.round(numUsers * (repPercentage / 100))} representatives, {Math.round(numUsers * (1 - repPercentage / 100))} citizens
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Important Note</h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      This will create real user accounts in the database. All users will have random secure passwords.
                      The email verification step is handled automatically for these test accounts.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateUsers}
                disabled={generating}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Generating Users...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Generate {numUsers} Test Users
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Generation Results */}
          {generationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                <div className="flex items-center">
                  <Database className="h-6 w-6 text-green-800 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Generation Results</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-6">
                  {generationResult.success ? (
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 mr-3" />
                  )}
                  <p className="text-lg font-medium">
                    {generationResult.message}
                  </p>
                </div>

                {generationResult.success && generationResult.stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Total Users</div>
                      <div className="text-2xl font-bold text-gray-900">{generationResult.stats.total}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Citizens</div>
                      <div className="text-2xl font-bold text-gray-900">{generationResult.stats.citizens}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Representatives</div>
                      <div className="text-2xl font-bold text-gray-900">{generationResult.stats.representatives}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Errors</div>
                      <div className="text-2xl font-bold text-gray-900">{generationResult.stats.errors}</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
      <BoltBadge />
    </div>
  );
}