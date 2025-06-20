import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useIdeas } from '../contexts/IdeasContext';
import { Globe2, MapPin, Users, TrendingUp, ChevronRight, MessageCircle, Vote, ArrowRight, Lightbulb, ThumbsUp, Calendar, BarChart3, Filter, FileEdit, Building2 } from 'lucide-react';
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
  const { voteOnIdea } = useIdeas();
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
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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

        // Get unique countries and states
        const uniqueCountries = [...new Set(data?.map(idea => idea.country))];
        setCountries(uniqueCountries);

        const uniqueStates = [...new Set(data?.map(idea => idea.location_value))];
        setStates(uniqueStates);

      } catch (error) {
        console.error('Error fetching ideas:', error);
        setError('Failed to load ideas');
      }
    };

    getStats();
    fetchIdeas();
  }, [filters]);

  const handleVote = async (ideaId: string, voteType: 'up' | 'down') => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Optimistically update UI
      setIdeas(prevIdeas =>
        prevIdeas.map(idea => {
          if (idea.id === ideaId) {
            const isChangingVote = idea.user_vote && idea.user_vote !== voteType;
            const isRemovingVote = idea.user_vote === voteType;
            
            let newUpvotes = idea.upvotes;
            let newDownvotes = idea.downvotes;
            
            // Remove existing vote if any
            if (idea.user_vote === 'up') newUpvotes--;
            if (idea.user_vote === 'down') newDownvotes--;
            
            // Add new vote if not removing
            if (!isRemovingVote) {
              if (voteType === 'up') newUpvotes++;
              if (voteType === 'down') newDownvotes++;
            }

            return {
              ...idea,
              upvotes: Math.max(0, newUpvotes),
              downvotes: Math.max(0, newDownvotes),
              user_vote: isRemovingVote ? null : voteType
            };
          }
          return idea;
        })
      );

      await voteOnIdea(ideaId, voteType);
    } catch (error) {
      console.error('Error voting:', error);
      // Revert optimistic update on error by refetching ideas
      const { data } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', ideaId)
        .single();
      
      if (data) {
        setIdeas(prevIdeas =>
          prevIdeas.map(idea =>
            idea.id === ideaId ? { ...idea, ...data } : idea
          )
        );
      }
    }
  };

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
  const regularIdeas = ideas.filter(idea => !idea.is_official_proposal);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
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
                    hover:bg-blue-900 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user ? 'Go to Dashboard' : 'Get Started'}
                  <ChevronRight className="inline-block ml-2 h-5 w-5" />
                </motion.button>
                <motion.button 
                  onClick={() => navigate('/roles')}
                  className="px-6 md:px-8 py-3 md:py-4 border-2 border-blue-800 text-blue-800 rounded-full font-medium text-lg 
                    hover:bg-blue-50 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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
      </motion.section>

      {/* Roles Overview Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
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
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <Users className="h-8 w-8 text-gray-600 group-hover:text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Citizen</h3>
                <p className="text-gray-600 text-center text-sm">
                  Community members who can create ideas, vote, and participate in civic discussions
                </p>
                <div className="mt-4 text-center">
                  <span className="text-xs text-blue-600 font-medium">10 weekly votes</span>
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
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Representative</h3>
                <p className="text-gray-600 text-center text-sm">
                  Government officials who can create priority official proposals
                </p>
                <div className="mt-4 text-center">
                  <span className="text-xs text-purple-600 font-medium">Official proposals</span>
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
        <section className="py-20 px-4 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
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

      {/* How Veroma Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              From idea to impact, see how your voice can make a difference
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of citizens creating positive change in their communities
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <motion.div 
              className="relative"
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FileEdit className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Share an Idea</h3>
                <p className="text-gray-600 text-center">
                  Submit a proposal, complaint, or start a vote about any issue in your community
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Vote className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Use Your Weekly Votes</h3>
                <p className="text-gray-600 text-center">
                  Get 10 votes every week to support ideas that matter to you
                </p>
                <div className="mt-2 text-sm text-center text-blue-600 font-medium">
                  10 votes weekly
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Gain Visibility</h3>
                <p className="text-gray-600 text-center">
                  Popular ideas rise to trending, reaching more people
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Globe2 className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Create Impact</h3>
                <p className="text-gray-600 text-center">
                  Ideas with strong support get noticed by decision-makers
                </p>
              </div>
            </motion.div>
          </div>

          {/* Weekly Voting System */}
          <motion.div 
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Weekly Voting System</h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Every Monday, you get 10 fresh votes to support ideas that matter. Use them wisely to help the best proposals gain visibility and create real impact in your community.
            </p>
            <motion.button
              onClick={handleGetStarted}
              className="inline-flex items-center px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Voting
              <ChevronRight className="ml-2 h-5 w-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Ideas Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ideas in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how citizens like you are making a difference, from local improvements to global initiatives
            </p>
          </motion.div>

          {/* Filters */}
          <div className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Filter Ideas</h3>
                  <p className="text-gray-600 mt-1">Discover ideas that matter to you</p>
                </div>
                <Filter className="h-6 w-6 text-blue-600" />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-colors hover:border-blue-300"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <select
                    value={filters.country}
                    onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-colors hover:border-blue-300"
                  >
                    <option value="all">All Countries</option>
                    {countries.map(country => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* State/Region Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    State/Region
                  </label>
                  <select
                    value={filters.state}
                    onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-colors hover:border-blue-300"
                  >
                    <option value="all">All States/Regions</option>
                    {states.map(state => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              <div className="mt-6 flex flex-wrap gap-2">
                {filters.category !== 'all' && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                    <span>{categories.find(cat => cat.value === filters.category)?.label}</span>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                      className="ml-2 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </div>
                )}
                {filters.country !== 'all' && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                    <span>{filters.country}</span>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, country: 'all' }))}
                      className="ml-2 hover:text-green-900"
                    >
                      ×
                    </button>
                  </div>
                )}
                {filters.state !== 'all' && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm">
                    <span>{filters.state}</span>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, state: 'all' }))}
                      className="ml-2 hover:text-purple-900"
                    >
                      ×
                    </button>
                  </div>
                )}
                {(filters.category !== 'all' || filters.country !== 'all' || filters.state !== 'all') && (
                  <button
                    onClick={() => setFilters({ category: 'all', country: 'all', state: 'all' })}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
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
              {Object.entries(groupedIdeas).map(([category, categoryIdeas]) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {categories.find(cat => cat.value === category)?.label || category}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    {categoryIdeas.slice(0, 4).map((idea) => (
                      <IdeaCard key={idea.id} idea={idea} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && !error && ideas.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-600">No ideas found for the selected filters.</p>
            </motion.div>
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

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gray-50">
        <motion.div 
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Growing Global Impact</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of citizens making a difference in communities worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              className="relative"
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FileEdit className="h-8 w-8 text-blue-600" />
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
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-green-800 mb-2 text-center">
                  {loading ? '...' : stats.totalUsers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 text-center font-medium">Active Citizens</div>
                <p className="mt-2 text-xs text-gray-500 text-center">Engaged community members driving change</p>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Globe2 className="h-8 w-8 text-purple-600" />
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