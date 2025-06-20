import React, { useEffect, useState } from 'react';
import { useIdeas } from '../contexts/IdeasContext';
import { useAuth } from '../contexts/AuthContext';
import IdeaCard from '../components/IdeaCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';
import CountryAutocomplete from '../components/CountryAutocomplete';
import { Loader, Filter, Search, X, TrendingUp, BarChart3, Calendar, Users, Crown, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

type Stats = {
  totalVotes: number;
  activeUsers: number;
  trendingCategories: { category: string; count: number }[];
  officialProposals: number;
  activeOfficialProposals: number;
};

type FilterState = {
  type: string;
  category: string;
  searchTerm: string;
  sortBy: 'newest' | 'popular' | 'controversial' | 'official' | 'ending_soon';
  timeRange: 'today' | 'week' | 'month' | 'all';
  country: string;
  showOfficialOnly: boolean;
};

export default function Dashboard() {
  const { ideas, loading, fetchIdeas, voteStatus } = useIdeas();
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalVotes: 0,
    activeUsers: 0,
    trendingCategories: [],
    officialProposals: 0,
    activeOfficialProposals: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    category: 'all',
    searchTerm: '',
    sortBy: 'official',
    timeRange: 'all',
    country: 'all',
    showOfficialOnly: false
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setError(null);
        await fetchIdeas();
        await fetchStats();
      } catch (error: any) {
        console.error('Error initializing dashboard:', error);
        setError(error.message || 'Failed to load dashboard data');
      }
    };

    initializeDashboard();
  }, []);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);

      const { count: votesCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true });

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString();

      const { data: activeVoters } = await supabase
        .from('votes')
        .select('user_id')
        .gte('voted_at', weekAgoStr)
        .order('user_id');

      const { data: activePosters } = await supabase
        .from('ideas')
        .select('user_id')
        .gte('created_at', weekAgoStr)
        .order('user_id');

      const activeUserIds = new Set([
        ...(activeVoters?.map(v => v.user_id) || []),
        ...(activePosters?.map(p => p.user_id) || [])
      ]);

      const { data: categoriesData } = await supabase
        .from('ideas')
        .select('category, upvotes')
        .gte('created_at', weekAgoStr)
        .order('upvotes', { ascending: false });

      const categoryCount = categoriesData?.reduce((acc, idea) => {
        acc[idea.category] = (acc[idea.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const trendingCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category: translateCategory(category), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Get official proposals stats
      const { count: officialProposalsCount } = await supabase
        .from('ideas')
        .select('*', { count: 'exact', head: true })
        .eq('is_official_proposal', true);

      const { count: activeOfficialProposalsCount } = await supabase
        .from('ideas')
        .select('*', { count: 'exact', head: true })
        .eq('is_official_proposal', true)
        .gt('voting_ends_at', new Date().toISOString());

      setStats({
        totalVotes: votesCount || 0,
        activeUsers: activeUserIds.size,
        trendingCategories,
        officialProposals: officialProposalsCount || 0,
        activeOfficialProposals: activeOfficialProposalsCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const filterIdeas = (ideasToFilter: any[]) => {
    let filtered = ideasToFilter.filter(idea => {
      const matchesType = filters.type === 'all' || idea.type === filters.type;
      const matchesCategory = filters.category === 'all' || idea.category === filters.category;
      const matchesCountry = filters.country === 'all' || idea.country === filters.country;
      const matchesSearch = idea.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                          idea.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      let matchesTimeRange = true;
      const ideaDate = new Date(idea.created_at);
      const now = new Date();
      
      switch (filters.timeRange) {
        case 'today':
          matchesTimeRange = ideaDate >= new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          matchesTimeRange = ideaDate >= new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          matchesTimeRange = ideaDate >= new Date(now.setMonth(now.getMonth() - 1));
          break;
      }

      // Filter for official proposals only if requested
      const matchesOfficialFilter = !filters.showOfficialOnly || idea.is_official_proposal;
      
      return matchesType && matchesCategory && matchesSearch && matchesTimeRange && matchesCountry && matchesOfficialFilter;
    });

    // Sort with official proposals prioritized
    return filtered.sort((a, b) => {
      // First, prioritize official proposals
      if (a.is_official_proposal && !b.is_official_proposal) return -1;
      if (!a.is_official_proposal && b.is_official_proposal) return 1;

      // For official proposals, prioritize those ending soon
      if (a.is_official_proposal && b.is_official_proposal) {
        const aEndsAt = a.voting_ends_at ? new Date(a.voting_ends_at).getTime() : Infinity;
        const bEndsAt = b.voting_ends_at ? new Date(b.voting_ends_at).getTime() : Infinity;
        const now = Date.now();
        
        // Both are ending soon (within 7 days)
        const aEndingSoon = aEndsAt - now < 7 * 24 * 60 * 60 * 1000;
        const bEndingSoon = bEndsAt - now < 7 * 24 * 60 * 60 * 1000;
        
        if (aEndingSoon && !bEndingSoon) return -1;
        if (!aEndingSoon && bEndingSoon) return 1;
        if (aEndingSoon && bEndingSoon) return aEndsAt - bEndsAt;
      }

      // Then apply the selected sort order
      switch (filters.sortBy) {
        case 'official':
          // Official proposals already prioritized above
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        case 'popular':
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        case 'controversial':
          return (b.upvotes + b.downvotes) - (a.upvotes + a.downvotes);
        case 'ending_soon':
          if (a.is_official_proposal && b.is_official_proposal) {
            const aEndsAt = a.voting_ends_at ? new Date(a.voting_ends_at).getTime() : Infinity;
            const bEndsAt = b.voting_ends_at ? new Date(b.voting_ends_at).getTime() : Infinity;
            return aEndsAt - bEndsAt;
          }
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };

  const translateCategory = (category: string) => {
    const translations: Record<string, string> = {
      'infraestructura': 'Infrastructure',
      'salud': 'Health',
      'seguridad': 'Security',
      'educacion': 'Education',
      'ambiente': 'Environment',
      'transporte': 'Transportation',
      'cultura': 'Culture',
      'economia': 'Economy',
      'otro': 'Other'
    };
    return translations[category] || category;
  };

  const handleCountryChange = (value: string) => {
    setFilters(prev => ({ ...prev, country: value || 'all' }));
  };

  const handleCountrySelect = (country: string) => {
    setFilters(prev => ({ ...prev, country }));
  };

  const filteredIdeas = ideas.length > 0 ? filterIdeas(ideas) : [];

  // Separate official proposals for special display
  const officialProposals = filteredIdeas.filter(idea => idea.is_official_proposal);
  const regularIdeas = filteredIdeas.filter(idea => !idea.is_official_proposal);

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

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access the dashboard</h2>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
        <Footer />
        <BoltBadge />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
            >
              Retry
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
      
      <div className="flex-grow pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Message */}
          <motion.div 
            className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Civic Dashboard
            </h1>
            <p className="text-gray-600">
              Discover and engage with ideas from around the world. Official proposals are prioritized for maximum impact.
            </p>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Remaining Votes</h3>
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-gray-900">{voteStatus?.votes_remaining || 0}</span>
                <span className="text-sm text-gray-500 ml-2">/ {voteStatus?.weekly_vote_limit || 10} weekly</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Total Votes</h3>
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {statsLoading ? (
                  <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
                ) : (
                  stats.totalVotes.toLocaleString()
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Active Users</h3>
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {statsLoading ? (
                  <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
                ) : (
                  stats.activeUsers.toLocaleString()
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Official Proposals</h3>
                <Crown className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {statsLoading ? (
                  <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
                ) : (
                  stats.officialProposals.toLocaleString()
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.activeOfficialProposals} active
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Trending Categories</h3>
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              {statsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex justify-between">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-4 w-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.trendingCategories.map((cat, index) => (
                    <div key={cat.category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{cat.category}</span>
                      <span className="text-sm font-medium text-gray-900">{cat.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="filters-button flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                
                <button
                  onClick={() => setFilters(prev => ({ ...prev, showOfficialOnly: !prev.showOfficialOnly }))}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    filters.showOfficialOnly 
                      ? 'bg-purple-100 text-purple-800 border-purple-300' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Official Only
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={filters.type}
                          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Types</option>
                          <option value="proposal">Proposals</option>
                          <option value="complaint">Complaints</option>
                          <option value="vote">Votes</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={filters.category}
                          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Categories</option>
                          {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time Range
                        </label>
                        <select
                          value={filters.timeRange}
                          onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as FilterState['timeRange'] })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Time</option>
                          <option value="today">Today</option>
                          <option value="week">This Week</option>
                          <option value="month">This Month</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sort By
                        </label>
                        <select
                          value={filters.sortBy}
                          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="official">Official First</option>
                          <option value="popular">Most Popular</option>
                          <option value="newest">Newest First</option>
                          <option value="controversial">Most Discussed</option>
                          <option value="ending_soon">Ending Soon</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <CountryAutocomplete
                          value={filters.country === 'all' ? '' : filters.country}
                          onChange={handleCountryChange}
                          onSelect={handleCountrySelect}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Search
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={filters.searchTerm}
                            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                            placeholder="Search ideas..."
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          {filters.searchTerm && (
                            <button
                              onClick={() => setFilters({ ...filters, searchTerm: '' })}
                              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="h-8 w-8 text-blue-800 animate-spin" />
              </div>
            ) : filteredIdeas.length === 0 ? (
              <motion.div 
                className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-lg text-gray-600 mb-2">
                  No ideas found for these filters.
                </p>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or be the first to share an idea!
                </p>
                <button 
                  onClick={() => window.location.href = '/new-idea'} 
                  className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
                >
                  Share an Idea
                </button>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {/* Official Proposals Section */}
                {officialProposals.length > 0 && !filters.showOfficialOnly && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Crown className="h-6 w-6 text-purple-600 mr-2" />
                        <h2 className="text-xl font-bold text-gray-900">Official Proposals</h2>
                        <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                          {officialProposals.length}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Priority voting
                      </div>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      {officialProposals.map((idea) => (
                        <IdeaCard key={idea.id} idea={idea} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Regular Ideas Section */}
                {(regularIdeas.length > 0 || filters.showOfficialOnly) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: officialProposals.length > 0 ? 0.2 : 0 }}
                    className="space-y-6"
                  >
                    {!filters.showOfficialOnly && regularIdeas.length > 0 && (
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Community Ideas</h2>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                          {regularIdeas.length}
                        </span>
                      </div>
                    )}
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      {(filters.showOfficialOnly ? officialProposals : regularIdeas).map((idea) => (
                        <IdeaCard key={idea.id} idea={idea} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <BoltBadge />
    </div>
  );
}