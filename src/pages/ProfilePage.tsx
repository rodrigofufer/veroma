import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useIdeas } from '../contexts/IdeasContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';
import IdeaCard from '../components/IdeaCard';
import UserVoteHistory from '../components/UserVoteHistory';
import CountryAutocomplete from '../components/CountryAutocomplete';
import { User, Settings, Loader, Calendar, BarChart3, MapPin, Mail, Clock, Shield, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

type ProfileData = {
  id: string;
  name: string;
  country: string;
  created_at: string;
  email_confirmed_at: string | null;
  votes_remaining: number;
  votes_reset_at: string;
};

type UserStats = {
  totalIdeas: number;
  totalVotes: number;
  upvotesReceived: number;
  downvotesReceived: number;
  mostActiveCategory: string;
  mostVotedIdea: {
    title: string;
    votes: number;
  } | null;
};

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { userIdeas, fetchUserIdeas } = useIdeas();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [formErrors, setFormErrors] = useState({
    country: ''
  });
  const [stats, setStats] = useState<UserStats>({
    totalIdeas: 0,
    totalVotes: 0,
    upvotesReceived: 0,
    downvotesReceived: 0,
    mostActiveCategory: '',
    mostVotedIdea: null
  });
  const [showVoteHistory, setShowVoteHistory] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (!user) return;
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        setProfile(profileData);
        setName(profileData?.name || '');
        setCountry(profileData?.country || '');

        // Fetch user stats
        const { data: votesData } = await supabase
          .from('votes')
          .select('vote_type')
          .eq('user_id', user.id);

        const { data: ideasStats } = await supabase
          .from('ideas')
          .select('category, upvotes, downvotes, title')
          .eq('user_id', user.id);

        if (ideasStats && ideasStats.length > 0) {
          // Calculate most active category
          const categoryCount: Record<string, number> = {};
          ideasStats.forEach(idea => {
            categoryCount[idea.category] = (categoryCount[idea.category] || 0) + 1;
          });
          const mostActiveCategory = Object.entries(categoryCount)
            .sort(([,a], [,b]) => b - a)[0][0];

          // Find most voted idea
          const mostVotedIdea = ideasStats
            .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))[0];

          setStats({
            totalIdeas: ideasStats.length,
            totalVotes: votesData?.length || 0,
            upvotesReceived: ideasStats.reduce((sum, idea) => sum + idea.upvotes, 0),
            downvotesReceived: ideasStats.reduce((sum, idea) => sum + idea.downvotes, 0),
            mostActiveCategory,
            mostVotedIdea: mostVotedIdea ? {
              title: mostVotedIdea.title,
              votes: mostVotedIdea.upvotes - mostVotedIdea.downvotes
            } : null
          });
        }
        
        fetchUserIdeas();
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({ country: '' });

    try {
      if (!country) {
        setFormErrors({ country: 'Please select a valid country' });
        return;
      }

      await updateProfile({
        name,
        country
      });
      
      if (profile) {
        setProfile({
          ...profile,
          name,
          country
        });
      }
      
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCountryChange = (value: string) => {
    setCountry(value);
    setFormErrors(prev => ({ ...prev, country: '' }));
  };

  const handleCountrySelect = (selectedCountry: string) => {
    setCountry(selectedCountry);
    setFormErrors(prev => ({ ...prev, country: '' }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow pt-24 flex justify-center items-center">
          <Loader className="h-8 w-8 text-blue-800 animate-spin" />
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
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
              <button 
                onClick={() => setEditing(!editing)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4 mr-2" />
                {editing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <motion.div 
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {editing ? (
                  <div className="p-6">
                    <form onSubmit={handleUpdateProfile}>
                      <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="flex items-center">
                          <input
                            id="email"
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          />
                          {profile?.email_confirmed_at && (
                            <Shield className="h-5 w-5 text-green-500 ml-2" />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Email cannot be changed
                        </p>
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <CountryAutocomplete
                          value={country}
                          onChange={handleCountryChange}
                          onSelect={handleCountrySelect}
                          error={formErrors.country}
                        />
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full flex justify-center items-center px-6 py-2 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition-colors"
                      >
                        Save Changes
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="flex justify-center mb-6">
                      <div className="bg-blue-100 rounded-full p-6">
                        <User className="h-16 w-16 text-blue-800" />
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">
                      {profile?.name || 'Complete Your Profile'}
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm text-gray-900">{user?.email}</div>
                          <div className="text-xs text-gray-500">
                            {profile?.email_confirmed_at ? 'Verified' : 'Not verified'}
                          </div>
                        </div>
                        {profile?.email_confirmed_at && (
                          <Shield className="h-5 w-5 text-green-500 ml-auto" />
                        )}
                      </div>

                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm text-gray-900">{profile?.country || 'Not set'}</div>
                          <div className="text-xs text-gray-500">Location</div>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">Member since</div>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Votes Status */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Weekly Votes</h3>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Remaining</span>
                          <span className="text-lg font-semibold text-blue-800">
                            {profile?.votes_remaining || 0}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Resets on {formatDate(profile?.votes_reset_at || '')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Stats Cards */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <motion.div 
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-900">{stats.totalIdeas}</span>
                  </div>
                  <div className="text-sm text-gray-600">Ideas Shared</div>
                </motion.div>

                <motion.div 
                  className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer transition-all duration-200 ${
                    showVoteHistory ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => setShowVoteHistory(!showVoteHistory)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">{stats.totalVotes}</span>
                  </div>
                  <div className="text-sm text-gray-600">Total Votes Cast</div>
                </motion.div>

                <motion.div 
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <ThumbsUp className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">{stats.upvotesReceived}</span>
                  </div>
                  <div className="text-sm text-gray-600">Upvotes Received</div>
                </motion.div>

                <motion.div 
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <ThumbsDown className="h-5 w-5 text-red-600" />
                    <span className="text-2xl font-bold text-gray-900">{stats.downvotesReceived}</span>
                  </div>
                  <div className="text-sm text-gray-600">Downvotes Received</div>
                </motion.div>
              </div>
            </div>
            
            {/* Ideas Section */}
            <div className="lg:col-span-2">
              <motion.div 
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Your Ideas</h2>
                    <button 
                      onClick={() => navigate('/new-idea')}
                      className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors text-sm font-medium"
                    >
                      Share New Idea
                    </button>
                  </div>

                  {stats.mostActiveCategory && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Activity Insights</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Most Active Category</div>
                          <div className="text-lg font-medium text-blue-800">
                            {translateCategory(stats.mostActiveCategory)}
                          </div>
                        </div>
                        {stats.mostVotedIdea && (
                          <div>
                            <div className="text-sm text-gray-600">Most Voted Idea</div>
                            <div className="text-lg font-medium text-blue-800">
                              {stats.mostVotedIdea.title}
                              <span className="text-sm text-gray-600 ml-2">
                                ({stats.mostVotedIdea.votes > 0 ? '+' : ''}{stats.mostVotedIdea.votes} votes)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {userIdeas.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600 mb-4">You haven't shared any ideas yet.</p>
                      <button 
                        onClick={() => navigate('/new-idea')} 
                        className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
                      >
                        Share Your First Idea
                      </button>
                    </div>
                  ) : (
                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ staggerChildren: 0.1 }}
                    >
                      {userIdeas.map((idea) => (
                        <IdeaCard key={idea.id} idea={idea} />
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Vote History Section */}
              <AnimatePresence>
                {showVoteHistory && profile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-8"
                  >
                    <UserVoteHistory 
                      userId={profile.id}
                      onClose={() => setShowVoteHistory(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <BoltBadge />
    </div>
  );
}