import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MapPin, Calendar, Tag, Share2, MoreVertical, Edit2, Trash2, HelpCircle, Info, Building2, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIdeas, type Idea } from '../contexts/IdeasContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

type IdeaCardProps = {
  idea: Idea;
};

export default function IdeaCard({ idea }: IdeaCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showVoteHelp, setShowVoteHelp] = useState(false);
  const [showLocationHelp, setShowLocationHelp] = useState(false);
  const [showCategoryHelp, setShowCategoryHelp] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(idea.title);
  const [editedDescription, setEditedDescription] = useState(idea.description);
  const [isVoting, setIsVoting] = useState(false);
  const { voteOnIdea, updateIdea, deleteIdea } = useIdeas();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isVoting) return; // Prevent double voting

    setIsVoting(true);
    try {
      await voteOnIdea(idea.id, voteType);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: idea.title,
        text: idea.description,
        url: window.location.href
      });
    } catch (error) {
      toast.error('Sharing is not supported on this device');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      await deleteIdea(idea.id);
    }
    setShowMenu(false);
  };

  const handleSaveEdit = async () => {
    await updateIdea(idea.id, {
      title: editedTitle,
      description: editedDescription
    });
    setIsEditing(false);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatVotingDeadline = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Voting ended', color: 'text-red-600', urgent: false };
    } else if (diffDays === 0) {
      return { text: 'Ends today', color: 'text-red-600', urgent: true };
    } else if (diffDays === 1) {
      return { text: 'Ends tomorrow', color: 'text-orange-600', urgent: true };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days left`, color: 'text-orange-600', urgent: true };
    } else {
      return { text: `${diffDays} days left`, color: 'text-gray-600', urgent: false };
    }
  };
  
  const getIdeaTypeStyles = () => {
    switch(idea.type) {
      case 'complaint': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'proposal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'vote': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryStyles = () => {
    const styles = {
      'infraestructura': 'bg-purple-100 text-purple-800 border-purple-200',
      'salud': 'bg-red-100 text-red-800 border-red-200',
      'seguridad': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'educacion': 'bg-blue-100 text-blue-800 border-blue-200',
      'ambiente': 'bg-green-100 text-green-800 border-green-200',
      'transporte': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'cultura': 'bg-pink-100 text-pink-800 border-pink-200',
      'economia': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'otro': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return styles[idea.category] || styles.otro;
  };

  const translateCategory = (category: string) => {
    const translations = {
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

  const voteCount = (idea.upvotes || 0) - (idea.downvotes || 0);
  const voteColor = voteCount > 0 ? 'text-green-600' : voteCount < 0 ? 'text-red-600' : 'text-gray-600';
  const isOwner = user?.id === idea.user_id;

  // Check if voting deadline is approaching
  const votingDeadline = idea.voting_ends_at ? formatVotingDeadline(idea.voting_ends_at) : null;
  const isVotingActive = idea.voting_ends_at ? new Date(idea.voting_ends_at) > new Date() : true;

  return (
    <motion.div 
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border ${
        idea.is_official_proposal 
          ? 'border-purple-200 ring-2 ring-purple-100' 
          : 'border-gray-100'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Official Proposal Header */}
      {idea.is_official_proposal && (
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              <span className="font-semibold text-sm">Official Proposal</span>
            </div>
            {votingDeadline && (
              <div className={`flex items-center text-sm ${
                votingDeadline.urgent ? 'text-yellow-200' : 'text-purple-100'
              }`}>
                <Clock className="h-4 w-4 mr-1" />
                {votingDeadline.text}
                {votingDeadline.urgent && (
                  <AlertTriangle className="h-4 w-4 ml-1" />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-grow">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="relative">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${getIdeaTypeStyles()}`}>
                  {idea.type}
                </span>
                <button
                  onClick={() => setShowCategoryHelp(!showCategoryHelp)}
                  className="ml-1 text-gray-400 hover:text-gray-600 inline-flex items-center"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
                <AnimatePresence>
                  {showCategoryHelp && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 mt-2 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-100"
                    >
                      <h4 className="font-medium text-gray-900 mb-2">Idea Types</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li><strong>Proposal:</strong> Suggest a solution or improvement</li>
                        <li><strong>Complaint:</strong> Report an issue that needs attention</li>
                        <li><strong>Vote:</strong> Gauge public opinion on a topic</li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryStyles()}`}>
                {translateCategory(idea.category)}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{idea.title}</h3>
                <div className="flex items-center text-gray-500 text-sm space-x-4 mb-3">
                  <div className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>{idea.location_value}, {idea.country}</span>
                  </div>
                  <div className="flex items-center">
                    <Tag className="h-3.5 w-3.5 mr-1" />
                    <span className="capitalize">{idea.location_level}</span>
                  </div>
                </div>

                {/* Voting Deadline for Official Proposals */}
                {idea.is_official_proposal && idea.voting_ends_at && (
                  <div className={`flex items-center mb-3 p-2 rounded-lg ${
                    votingDeadline?.urgent 
                      ? 'bg-orange-50 border border-orange-200' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <Clock className={`h-4 w-4 mr-2 ${votingDeadline?.color || 'text-gray-600'}`} />
                    <span className={`text-sm font-medium ${votingDeadline?.color || 'text-gray-600'}`}>
                      Voting {votingDeadline?.text} • {formatDate(idea.voting_ends_at)}
                    </span>
                    {votingDeadline?.urgent && (
                      <AlertTriangle className="h-4 w-4 ml-2 text-orange-600" />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="flex items-start space-x-2">
            {isOwner && !isEditing && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10"
                    >
                      <button
                        onClick={handleEdit}
                        className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-t-lg"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Idea
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-lg"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Idea
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className={`flex flex-col items-center space-y-2 rounded-xl p-3 ${
              idea.is_official_proposal 
                ? 'bg-purple-50 border border-purple-200' 
                : 'bg-gray-50'
            }`}>
              <div className="relative">
                <button
                  onClick={() => setShowVoteHelp(!showVoteHelp)}
                  className="absolute -right-8 -top-2 text-gray-400 hover:text-gray-600"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {showVoteHelp && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-100 z-10"
                    >
                      <h4 className="font-medium text-gray-900 mb-2">Voting System</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>You have 10 votes per week</li>
                        <li>Votes reset every Monday at 00:00 UTC</li>
                        <li>Support ideas you agree with</li>
                        <li>Oppose ideas you disagree with</li>
                        <li>You can change your vote anytime</li>
                        {idea.is_official_proposal && (
                          <li className="text-purple-600 font-medium">Official proposals have priority!</li>
                        )}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button 
                className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 ${
                  isVoting ? 'opacity-50 cursor-not-allowed' :
                  idea.user_vote === 'up' 
                    ? 'bg-green-100 text-green-600' 
                    : 'hover:bg-gray-100 text-gray-400 hover:text-green-600'
                } ${!isVotingActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => isVotingActive && handleVote('up')}
                whileHover={isVotingActive ? { scale: 1.1 } : {}}
                whileTap={isVotingActive ? { scale: 0.9 } : {}}
                title={isVotingActive ? "Support this idea" : "Voting has ended"}
                disabled={isVoting || !isVotingActive}
              >
                <ThumbsUp className="h-6 w-6" />
              </motion.button>

              <AnimatePresence>
                <motion.div 
                  key={voteCount}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`text-lg font-semibold ${voteColor} bg-white px-3 py-1 rounded-lg text-center ${
                    idea.is_official_proposal ? 'border border-purple-200' : ''
                  }`}
                >
                  {voteCount}
                </motion.div>
              </AnimatePresence>

              <motion.button 
                className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 ${
                  isVoting ? 'opacity-50 cursor-not-allowed' :
                  idea.user_vote === 'down' 
                    ? 'bg-red-100 text-red-600' 
                    : 'hover:bg-gray-100 text-gray-400 hover:text-red-600'
                } ${!isVotingActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => isVotingActive && handleVote('down')}
                whileHover={isVotingActive ? { scale: 1.1 } : {}}
                whileTap={isVotingActive ? { scale: 0.9 } : {}}
                title={isVotingActive ? "Oppose this idea" : "Voting has ended"}
                disabled={isVoting || !isVotingActive}
              >
                <ThumbsDown className="h-6 w-6" />
              </motion.button>
            </div>
          </div>
        </div>
        
        {!isEditing && (
          <div className="mt-4">
            <p className={`text-gray-600 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
              {idea.description}
            </p>
            
            {idea.description.length > 180 && (
              <button 
                className="text-blue-600 text-sm mt-2 hover:text-blue-800 focus:outline-none font-medium"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(idea.created_at)}</span>
            </div>
            <div>
              {idea.is_anonymous
                ? 'Anonymous'
                : (idea.author_name && idea.author_name.trim() !== '' && idea.author_name !== 'Unknown'
                    ? `By: ${idea.author_name}`
                    : 'Author not specified')}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}