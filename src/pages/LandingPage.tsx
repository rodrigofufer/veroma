import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { Globe2, Users, TrendingUp, ChevronRight, Vote, ArrowRight, Lightbulb, Calendar, FileEdit, Building2, Shield, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';
import IdeaCard from '../components/IdeaCard';
import { fetchPublicStats, supabase } from '../utils/supabaseClient';

type Stats = {
  totalIdeas: number;
  totalUsers: number;
  totalCountries: number;
};

type Filters = {
  category: string;
  country: string;
  state: string;
};

type Idea = {
  id: string;
  title: string;
  description: string;
  type: 'complaint' | 'proposal' | 'vote';
  location_value: string;
  location_level: string;
  country: string;
  created_at: string;
  user_id: string;
  author_name: string;
  upvotes: number;
  downvotes: number;
  is_anonymous: boolean;
  category: string;
  user_vote?: 'up' | 'down' | null;
  is_official_proposal?: boolean;
  voting_ends_at?: string | null;
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, refreshSession } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalIdeas: 0,
    totalUsers: 0,
    totalCountries: 0
  });
  const [loading, setLoading] = useState(true);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    country: 'all',
    state: 'all'
  });
  const [error, setError] = useState<string | null>(null);
  const [showIntroModal, setShowIntroModal] = useState(false);

  // Refresh session when landing page loads to ensure auth state is current
  useEffect(() => {
    const refreshUserSession = async () => {
      if (user) {
        try {
          await refreshSession();
        } catch (err) {
          console.error('Error refreshing session:', err);
        }
      }
    };
    
    refreshUserSession();
  }, [user, refreshSession]);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  useEffect(() => {
    // Check if this is the first visit
    const hasVisitedBefore = localStorage.getItem('veroma_visited');
    if (!hasVisitedBefore && !user) {
      setShowIntroModal(true);
      localStorage.setItem('veroma_visited', 'true');
    }

    const getStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const publicStats = await fetchPublicStats();
        setStats(publicStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    const fetchIdeas = async () => {
      try {
        setError(null);
        let query = supabase
          .from('ideas')
          .select(`
            *,
            profiles (
              name
            ),
            votes (
              vote_type
            )
          `)
          .order('upvotes', { ascending: false })
          .limit(50);

        if (filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }
        if (filters.country !== 'all') {
          query = query.eq('country', filters.country);
        }
        if (filters.state !== 'all') {
          query = query.eq('location_value', filters.state);
        }

        const { data, error } = await query;

        if (error) throw error;

        const processedIdeas = data?.map(idea => ({
          ...idea,
          author_name: idea.is_anonymous ? null : idea.profiles?.name,
          user_vote: idea.votes?.[0]?.vote_type || null
        })) || [];

        setIdeas(processedIdeas);


      } catch (error) {
        console.error('Error fetching ideas:', error);
        setError('Failed to load ideas');
      }
    };

    getStats();
    fetchIdeas();
  }, [filters, user]);


  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'infraestructura', label: 'Infrastructure' },
    { value: 'salud', label: 'Health' },
    { value: 'seguridad', label: 'Security' },
    { value: 'educacion', label: 'Education' },
    { value: 'ambiente', label: 'Environment' },
    { value: 'transporte', label: 'Transportation' },
    { value: 'cultura', label: 'Culture' },
    { value: 'economia', label: 'Economy' },
    { value: 'otro', label: 'Other' }
  ];

  // Group ideas by category
  const groupedIdeas = ideas.reduce((acc, idea) => {
    const category = idea.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(idea);
    return acc;
  }, {} as Record<string, Idea[]>);

  // Separate official proposals for special display
  const officialProposals = ideas.filter(idea => idea.is_official_proposal);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Intro Modal */}
      <AnimatePresence>
        {showIntroModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl max-w-lg w-full p-6 md:p-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Welcome to Veroma!</h2>
                <button 
                  onClick={() => setShowIntroModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3 flex-shrink-0">
                    <Vote className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Global Civic Platform</h3>
                    <p className="text-gray-600 text-sm">Veroma is a platform that allows you to share ideas, proposals, and complaints from your neighborhood to the entire world.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">10 Weekly Votes</h3>
                    <p className="text-gray-600 text-sm">Each week you receive 10 votes to support the ideas that matter most to you. Votes reset every Monday.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-full mr-3 flex-shrink-0">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Official Proposals</h3>
                    <p className="text-gray-600 text-sm">Government representatives can create official proposals that receive priority on the platform.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowIntroModal(false);
                    navigate('/signup');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
                >
                  Create Account
                </button>
                <button
                  onClick={() => setShowIntroModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Explore First
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hero Section */}
      <motion.section 
        className="relative pt-24 pb-32 px-4 md:pt-32 md:pb-40 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute inset-0 bg-grid-pattern" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <img 
                src="/logobk2.png" 
                alt="Veroma" 
                className="h-12 md:h-16 w-auto mx-auto mb-6 md:mb-8"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = '/logobk.png';
                }}
              />
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                Your Voice, From Local to Global
              </h1>
              <p className="text-lg md:text-2xl text-gray-600 mb-8 md:mb-10 leading-relaxed">
                Veroma empowers citizens to raise their concerns, share ideas, and vote on proposals
                that impact their communities and the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button 
                  onClick={handleGetStarted}
                  className="px-6 md:px-8 py-3 md:py-4 bg-blue-800 text-white rounded-full font-medium text-lg 
                    hover:bg-blue-900 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user ? 'Go to Dashboard' : 'Get Started'}
                  <ChevronRight className="inline-block ml-2 h-5 w-5" />
                </motion.button>
                <motion.button 
                  onClick={() => navigate('/roles')}
                  className="px-6 md:px-8 py-3 md:py-4 border-2 border-blue-800 text-blue-800 rounded-full font-medium text-lg 
                    hover:bg-blue-50 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn About Roles
                  <Building2 className="inline-block ml-2 h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 text-blue-200"
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Vote className="h-8 w-8" />
          </motion.div>
          <motion.div
            className="absolute top-40 right-20 text-purple-200"
            animate={{ 
              y: [0, 15, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          >
            <Globe2 className="h-6 w-6" />
          </motion.div>
          <motion.div
            className="absolute bottom-40 left-20 text-green-200"
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 3, 0]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          >
            <Lightbulb className="h-10 w-10" />
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-medium mb-4">
              How It Works
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Three simple steps to participate
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Veroma makes it easy to contribute to improving your community and the world
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div 
              className="relative"
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-100 rounded-full opacity-30 animate-ping"></div>
                    <div className="relative bg-blue-100 rounded-full p-4">
                      <FileEdit className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">1. Share Your Idea</h3>
                <p className="text-gray-600 text-center">
                  Create proposals, report problems, or start votes on issues that matter to you.
                </p>
                <div className="mt-4 flex justify-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Check className="h-3 w-3 mr-1" />
                    Easy to create
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-100 rounded-full opacity-30 animate-ping"></div>
                    <div className="relative bg-green-100 rounded-full p-4">
                      <Vote className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">2. Vote Weekly</h3>
                <p className="text-gray-600 text-center">
                  Receive 10 votes each week to support the ideas you consider most important.
                </p>
                <div className="mt-4 flex justify-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Calendar className="h-3 w-3 mr-1" />
                    10 weekly votes
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-100 rounded-full opacity-30 animate-ping"></div>
                    <div className="relative bg-purple-100 rounded-full p-4">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">3. Create Impact</h3>
                <p className="text-gray-600 text-center">
                  Popular ideas gain visibility and can become real changes.
                </p>
                <div className="mt-4 flex justify-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Globe2 className="h-3 w-3 mr-1" />
                    Global reach
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Roles Overview Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block bg-purple-100 text-purple-800 px-4 py-1 rounded-full text-sm font-medium mb-4">
              Platform Roles
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              A Platform for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're a citizen or a government representative, you can make a difference
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div 
              className="relative group cursor-pointer"
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => navigate('/roles#user')}
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 group-hover:border-blue-200 transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gray-100 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <Users className="h-10 w-10 text-gray-600 group-hover:text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">Citizen</h3>
                <p className="text-gray-600 text-center mb-6">
                  Community members who can create ideas, vote, and participate in civic discussions.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">10 weekly votes</span>
                  <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full font-medium">Create proposals</span>
                  <span className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-medium">Global participation</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative group cursor-pointer"
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => navigate('/roles#representative')}
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-purple-200 group-hover:border-purple-300 transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                    <Building2 className="h-10 w-10 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">Representative</h3>
                <p className="text-gray-600 text-center mb-6">
                  Government officials who can create official proposals with priority on the platform.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-medium">Official proposals</span>
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium">Voting deadlines</span>
                  <span className="text-xs bg-pink-50 text-pink-600 px-3 py-1 rounded-full font-medium">Detailed metrics</span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <button
              onClick={() => navigate('/roles')}
              className="inline-flex items-center px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
            >
              View Role Details
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Official Proposals Section */}
      {officialProposals.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-block bg-purple-100 text-purple-800 px-4 py-1 rounded-full text-sm font-medium mb-4">
                Featured
              </div>
              <div className="flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-purple-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Official Proposals</h2>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Initiatives presented by government representatives with priority on the platform
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {officialProposals.slice(0, 4).map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>

            {officialProposals.length > 4 && (
              <div className="text-center">
                <button
                  onClick={() => navigate('/dashboard?filter=official')}
                  className="inline-flex items-center px-6 py-3 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition-colors"
                >
                  View All Official Proposals
                  <Building2 className="ml-2 h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <motion.div 
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-medium mb-4">
              Global Impact
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Growing Together</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of citizens who are making a difference in communities worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="relative"
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                    <FileEdit className="h-10 w-10 text-blue-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-blue-800 mb-2 text-center">
                  {loading ? '...' : stats.totalIdeas.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 text-center font-medium">Ideas Shared</div>
                <p className="mt-2 text-xs text-gray-500 text-center">Proposals and initiatives from citizens worldwide</p>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl">
                    <Users className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-green-800 mb-2 text-center">
                  {loading ? '...' : stats.totalUsers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 text-center font-medium">Active Citizens</div>
                <p className="mt-2 text-xs text-gray-500 text-center">Community members driving change</p>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                    <Globe2 className="h-10 w-10 text-purple-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-purple-800 mb-2 text-center">
                  {loading ? '...' : stats.totalCountries.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 text-center font-medium">Countries</div>
                <p className="mt-2 text-xs text-gray-500 text-center">Global reach across continents</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Featured Ideas Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium mb-4">
              Featured Ideas
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ideas in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover how citizens like you are making a difference, from local improvements to global initiatives
            </p>
          </motion.div>

          {/* Category Tabs */}
          <div className="mb-12 overflow-x-auto">
            <div className="flex space-x-2 pb-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setFilters(prev => ({ ...prev, category: category.value }))}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    filters.category === category.value
                      ? 'bg-blue-800 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <motion.div 
              className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && !error && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mb-4"></div>
              <p className="text-gray-600">Loading ideas...</p>
            </motion.div>
          )}

          {/* Ideas Grid */}
          {!loading && !error && (
            <div className="space-y-16">
              {Object.entries(groupedIdeas).length > 0 ? (
                Object.entries(groupedIdeas).map(([category, categoryIdeas]) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="w-2 h-8 bg-blue-800 rounded-full mr-3"></span>
                      {categories.find(cat => cat.value === category)?.label || category}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      {categoryIdeas.slice(0, 4).map((idea) => (
                        <IdeaCard key={idea.id} idea={idea} />
                      ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="text-center py-12 bg-white rounded-xl shadow-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No ideas found for the selected filters.</p>
                  <p className="text-gray-500 mb-6">Be the first to share an idea!</p>
                  <button
                    onClick={handleGetStarted}
                    className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
                  >
                    Share an Idea
                  </button>
                </motion.div>
              )}
            </div>
          )}

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
            >
              Share Your Idea
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-800 to-indigo-900 text-white">
        <motion.div 
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src="/logowh2.png" 
            alt="Veroma" 
            className="h-12 w-auto mx-auto mb-8"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = '/logowh.png';
            }}
          />
          <h2 className="text-4xl font-bold mb-6">Join the Civic Movement</h2>
          <p className="text-xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Be part of a platform that amplifies citizen voices and drives positive change in communities worldwide.
          </p>
          <motion.button 
            onClick={handleGetStarted}
            className="px-8 py-4 bg-white text-blue-800 rounded-full font-medium text-lg 
              hover:bg-blue-50 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {user ? 'Go to Dashboard' : 'Create an Account'}
            <ChevronRight className="inline-block ml-2 h-5 w-5" />
          </motion.button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block bg-indigo-100 text-indigo-800 px-4 py-1 rounded-full text-sm font-medium mb-4">
              Features
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Designed for Civic Participation
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools that facilitate collaboration and positive change
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-blue-50 p-3 rounded-lg inline-block mb-4">
                <Vote className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Weekly Voting System</h3>
              <p className="text-gray-600 text-sm">
                10 votes each week to support the ideas that matter most to you. Votes reset every Monday.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-green-50 p-3 rounded-lg inline-block mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Anonymous Posting</h3>
              <p className="text-gray-600 text-sm">
                Share ideas anonymously to protect your privacy while contributing to the community.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-purple-50 p-3 rounded-lg inline-block mb-4">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Official Proposals</h3>
              <p className="text-gray-600 text-sm">
                Representatives can create official proposals with defined voting deadlines.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-orange-50 p-3 rounded-lg inline-block mb-4">
                <Globe2 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Reach</h3>
              <p className="text-gray-600 text-sm">
                From your neighborhood to the entire world, your voice can create real change.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block bg-amber-100 text-amber-800 px-4 py-1 rounded-full text-sm font-medium mb-4">
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Answers to Your Questions
            </h2>
          </motion.div>

          <div className="space-y-6">
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Info className="h-5 w-5 text-blue-600 mr-2" />
                How does the voting system work?
              </h3>
              <p className="text-gray-600">
                Each user receives 10 votes per week. Votes reset every Monday at 00:00 UTC. You can use your votes to support or oppose ideas, and you can change or remove your votes at any time.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Info className="h-5 w-5 text-blue-600 mr-2" />
                Can I post anonymously?
              </h3>
              <p className="text-gray-600">
                Yes, you can choose to post ideas anonymously. Your identity will be hidden from other users, but we maintain internal records for moderation purposes.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Info className="h-5 w-5 text-blue-600 mr-2" />
                What happens to successful ideas?
              </h3>
              <p className="text-gray-600">
                Popular ideas gain visibility and may be featured in our global trending section. We also work with local organizations and authorities to help implement viable proposals.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Info className="h-5 w-5 text-blue-600 mr-2" />
                What are official proposals?
              </h3>
              <p className="text-gray-600">
                Official proposals are initiatives created by verified government representatives. They receive priority on the platform and have defined voting deadlines. Results may be forwarded to relevant authorities.
              </p>
            </motion.div>
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <button
              onClick={() => navigate('/support')}
              className="inline-flex items-center px-6 py-3 border border-blue-800 text-blue-800 rounded-lg hover:bg-blue-50 transition-colors"
            >
              View All Questions
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </motion.div>
        </div>
      </section>
      
      <Footer />

      <style>{`
        .bg-grid-pattern {
          background-image: radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
        }
      `}</style>

      <BoltBadge />
    </div>
  );
}