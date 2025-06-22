import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdeas } from '../contexts/IdeasContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';
import LocationAutocomplete from '../components/LocationAutocomplete';
import CountryAutocomplete from '../components/CountryAutocomplete';
import type { Location } from '../utils/cities';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Globe2, AlertTriangle, HelpCircle, Eye, EyeOff, Send, Info, Building2, Calendar } from 'lucide-react';

type IdeaFormData = {
  title: string;
  description: string;
  type: 'complaint' | 'proposal' | 'vote';
  location: string;
  selectedLocation: Location | null;
  country: string;
  category: string;
  isAnonymous: boolean;
  isOfficialProposal: boolean;
  votingEndsAt: string;
};

const initialFormData: IdeaFormData = {
  title: '',
  description: '',
  type: 'proposal',
  location: '',
  selectedLocation: null,
  country: '',
  category: '',
  isAnonymous: false,
  isOfficialProposal: false,
  votingEndsAt: ''
};

const categories = [
  { value: 'infraestructura', label: 'Infrastructure', description: 'Roads, buildings, public spaces, and urban development' },
  { value: 'salud', label: 'Health', description: 'Healthcare services, public health initiatives, and medical facilities' },
  { value: 'seguridad', label: 'Security', description: 'Public safety, crime prevention, and emergency services' },
  { value: 'educacion', label: 'Education', description: 'Schools, educational programs, and learning initiatives' },
  { value: 'ambiente', label: 'Environment', description: 'Environmental protection, sustainability, and green initiatives' },
  { value: 'transporte', label: 'Transportation', description: 'Public transit, traffic management, and mobility solutions' },
  { value: 'cultura', label: 'Culture', description: 'Arts, cultural events, and community activities' },
  { value: 'economia', label: 'Economy', description: 'Local business, economic development, and employment' },
  { value: 'otro', label: 'Other', description: 'Other topics not covered by the categories above' }
];

const ideaTypes = [
  { 
    value: 'proposal', 
    label: 'Proposal',
    description: 'Suggest a solution or improvement',
    icon: FileText,
    color: 'blue'
  },
  { 
    value: 'complaint', 
    label: 'Complaint',
    description: 'Report an issue or problem',
    icon: AlertTriangle,
    color: 'orange'
  },
  { 
    value: 'vote', 
    label: 'Vote',
    description: 'Gauge public opinion on a topic',
    icon: Globe2,
    color: 'green'
  }
];

export default function NewIdeaPage() {
  const [formData, setFormData] = useState<IdeaFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showAnonymousInfo, setShowAnonymousInfo] = useState(false);
  const [showOfficialInfo, setShowOfficialInfo] = useState(false);
  const [formErrors, setFormErrors] = useState({
    country: '',
    votingEndsAt: ''
  });
  const { createIdea } = useIdeas();
  const { role } = useAuth();
  const navigate = useNavigate();

  // Check user role on component mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({ country: '', votingEndsAt: '' });
    
    try {
      if (!formData.country) {
        setFormErrors(prev => ({ ...prev, country: 'Please select a valid country' }));
        return;
      }

      // Validate voting deadline for official proposals
      if (formData.isOfficialProposal && !formData.votingEndsAt) {
        setFormErrors(prev => ({ ...prev, votingEndsAt: 'Voting deadline is required for official proposals' }));
        return;
      }

      // Validate voting deadline is in the future
      if (formData.isOfficialProposal && formData.votingEndsAt) {
        const votingDate = new Date(formData.votingEndsAt);
        const now = new Date();
        if (votingDate <= now) {
          setFormErrors(prev => ({ ...prev, votingEndsAt: 'Voting deadline must be in the future' }));
          return;
        }
      }

      // Only representatives can create official proposals
      if (formData.isOfficialProposal && role !== 'representative') {
        throw new Error('Only representatives can create official proposals');
      }

      await createIdea({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        location_value: formData.selectedLocation?.name || formData.location,
        location_level: 'ciudad',
        country: formData.country,
        category: formData.category,
        is_anonymous: formData.isAnonymous,
        is_official_proposal: formData.isOfficialProposal,
        voting_ends_at: formData.isOfficialProposal ? formData.votingEndsAt : null
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating idea:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (loc: Location) => {
    setFormData(prev => ({
      ...prev,
      selectedLocation: loc,
      location: loc.name,
      country: loc.country
    }));
  };

  const handleCountryChange = (value: string) => {
    setFormData(prev => ({ ...prev, country: value }));
    setFormErrors(prev => ({ ...prev, country: '' }));
  };

  const handleCountrySelect = (country: string) => {
    setFormData(prev => ({ ...prev, country }));
    setFormErrors(prev => ({ ...prev, country: '' }));
  };

  const handleOfficialProposalChange = (checked: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      isOfficialProposal: checked,
      // Clear voting date if unchecking official proposal
      votingEndsAt: checked ? prev.votingEndsAt : ''
    }));
    setFormErrors(prev => ({ ...prev, votingEndsAt: '' }));
  };

  const handleVotingDateChange = (value: string) => {
    setFormData(prev => ({ ...prev, votingEndsAt: value }));
    setFormErrors(prev => ({ ...prev, votingEndsAt: '' }));
  };

  const getTypeStyles = (type: string) => {
    const styles = {
      proposal: 'border-blue-200 hover:border-blue-300 [&.selected]:bg-blue-50 [&.selected]:border-blue-400',
      complaint: 'border-orange-200 hover:border-orange-300 [&.selected]:bg-orange-50 [&.selected]:border-orange-400',
      vote: 'border-green-200 hover:border-green-300 [&.selected]:bg-green-50 [&.selected]:border-green-400'
    };
    return styles[type as keyof typeof styles] || '';
  };

  // Calculate minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Calculate maximum date (1 year from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Share Your Idea</h1>
                  <p className="mt-2 text-gray-600">
                    Your voice matters. Share your thoughts and make a difference.
                  </p>
                </div>
                <button
                  onClick={() => setShowTips(!showTips)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-blue-800 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Writing Tips
                </button>
              </div>

              {showTips && (
                <motion.div 
                  className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Writing Effective Ideas</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Do's</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center">
                          <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-2"></span>
                          Be clear and specific
                        </li>
                        <li className="flex items-center">
                          <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-2"></span>
                          Provide relevant details
                        </li>
                        <li className="flex items-center">
                          <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-2"></span>
                          Explain the impact
                        </li>
                        <li className="flex items-center">
                          <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-2"></span>
                          Suggest solutions
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Don'ts</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center">
                          <span className="h-1.5 w-1.5 bg-red-500 rounded-full mr-2"></span>
                          Use offensive language
                        </li>
                        <li className="flex items-center">
                          <span className="h-1.5 w-1.5 bg-red-500 rounded-full mr-2"></span>
                          Share personal information
                        </li>
                        <li className="flex items-center">
                          <span className="h-1.5 w-1.5 bg-red-500 rounded-full mr-2"></span>
                          Make unsubstantiated claims
                        </li>
                        <li className="flex items-center">
                          <span className="h-1.5 w-1.5 bg-red-500 rounded-full mr-2"></span>
                          Duplicate existing ideas
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Idea Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What type of idea would you like to share?
                  </label>
                  <div className="grid md:grid-cols-3 gap-4">
                    {ideaTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                        className={`relative p-4 text-left border rounded-xl transition-all ${getTypeStyles(type.value)} ${
                          formData.type === type.value ? 'selected' : ''
                        }`}
                      >
                        <type.icon className={`h-6 w-6 mb-2 text-${type.color}-600`} />
                        <h3 className="text-gray-900 font-medium mb-1">{type.label}</h3>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Official Proposal Option (Representatives Only) */}
                {role === 'representative' && (
                  <div className="border-t pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center">
                          <input
                            id="officialProposal"
                            type="checkbox"
                            checked={formData.isOfficialProposal}
                            onChange={(e) => handleOfficialProposalChange(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="officialProposal" className="ml-2 block text-sm text-gray-700 font-medium">
                            Mark as Official Proposal
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowOfficialInfo(!showOfficialInfo)}
                            className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <AnimatePresence>
                          {showOfficialInfo && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 p-4 bg-purple-50 rounded-lg text-sm"
                            >
                              <h4 className="font-medium text-purple-900 mb-2">About Official Proposals</h4>
                              <ul className="space-y-2 text-purple-800">
                                <li className="flex items-start">
                                  <span className="h-1.5 w-1.5 bg-purple-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                                  Official proposals are formal initiatives from representatives
                                </li>
                                <li className="flex items-start">
                                  <span className="h-1.5 w-1.5 bg-purple-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                                  They receive special visibility and priority in the platform
                                </li>
                                <li className="flex items-start">
                                  <span className="h-1.5 w-1.5 bg-purple-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                                  A voting deadline must be set for official proposals
                                </li>
                                <li className="flex items-start">
                                  <span className="h-1.5 w-1.5 bg-purple-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                                  Results may be forwarded to relevant authorities
                                </li>
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <Building2 className={`h-5 w-5 ml-4 ${formData.isOfficialProposal ? 'text-purple-600' : 'text-gray-400'}`} />
                    </div>

                    {/* Voting Deadline (Required for Official Proposals) */}
                    <AnimatePresence>
                      {formData.isOfficialProposal && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200"
                        >
                          <div className="flex items-center mb-3">
                            <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                            <label htmlFor="votingEndsAt" className="block text-sm font-medium text-purple-900">
                              Voting Deadline *
                            </label>
                          </div>
                          <input
                            id="votingEndsAt"
                            type="date"
                            value={formData.votingEndsAt}
                            onChange={(e) => handleVotingDateChange(e.target.value)}
                            min={getMinDate()}
                            max={getMaxDate()}
                            required={formData.isOfficialProposal}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                              formErrors.votingEndsAt 
                                ? 'border-red-300 focus:ring-red-500' 
                                : 'border-purple-300'
                            }`}
                          />
                          {formErrors.votingEndsAt && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.votingEndsAt}</p>
                          )}
                          <p className="mt-2 text-xs text-purple-700">
                            Set when voting on this official proposal should end. Must be between tomorrow and one year from now.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Title & Description */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      maxLength={150}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="A brief, descriptive title for your idea"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {150 - formData.title.length} characters remaining
                    </p>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your idea in detail. What's the issue? Why is it important? How could it be addressed?"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-3">
                    Category
                  </label>
                  <div className="grid md:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                      <motion.button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                        className={`relative p-6 text-left border rounded-xl transition-all ${
                          formData.category === cat.value 
                            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-md' 
                            : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {formData.category === cat.value && (
                          <motion.div
                            className="absolute inset-0 border-2 border-blue-400 rounded-xl"
                            layoutId="category-outline"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <div className="relative z-10">
                          <h3 className={`text-lg font-medium mb-2 ${
                            formData.category === cat.value ? 'text-blue-800' : 'text-gray-900'
                          }`}>
                            {cat.label}
                          </h3>
                          <p className={`text-sm ${
                            formData.category === cat.value ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {cat.description}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Location Selection */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <LocationAutocomplete
                      value={formData.location}
                      onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                      onSelect={handleLocationSelect}
                      placeholder="Enter city or municipality"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <CountryAutocomplete
                      value={formData.country}
                      onChange={handleCountryChange}
                      onSelect={handleCountrySelect}
                      error={formErrors.country}
                    />
                  </div>
                </div>

                {/* Privacy Options */}
                <div className="border-t pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center">
                        <input
                          id="anonymous"
                          type="checkbox"
                          checked={formData.isAnonymous}
                          onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                          disabled={formData.isOfficialProposal} // Official proposals cannot be anonymous
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                        />
                        <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                          Post anonymously
                          {formData.isOfficialProposal && (
                            <span className="text-xs text-gray-500 ml-1">(Not available for official proposals)</span>
                          )}
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAnonymousInfo(!showAnonymousInfo)}
                          className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <AnimatePresence>
                        {showAnonymousInfo && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-4 bg-blue-50 rounded-lg text-sm"
                          >
                            <h4 className="font-medium text-blue-900 mb-2">About Anonymous Posting</h4>
                            <ul className="space-y-2 text-blue-800">
                              <li className="flex items-start">
                                <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                                Your name and profile information won't be visible to other users
                              </li>
                              <li className="flex items-start">
                                <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                                The idea will still appear in your profile's "My Ideas" section
                              </li>
                              <li className="flex items-start">
                                <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                                Platform moderators can still identify you if needed
                              </li>
                              <li className="flex items-start">
                                <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                                You can't change the anonymity setting after posting
                              </li>
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {formData.isAnonymous ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 border-t pt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? 'Submitting...' : formData.isOfficialProposal ? 'Submit Official Proposal' : 'Submit Idea'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
      <BoltBadge />
    </div>
  );
}