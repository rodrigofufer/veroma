import React, { useState, useEffect } from 'react';
import { HelpCircle, Loader } from 'lucide-react';
import { useIdeas } from '../contexts/IdeasContext';
import VotingInfoTooltip from './VotingInfoTooltip';

export default function VotesDisplay() {
  const [showTooltip, setShowTooltip] = useState(false);
  const { voteStatus } = useIdeas();
  const [isLoading, setIsLoading] = useState(false);

  // Add error handling and loading state
  useEffect(() => {
    setIsLoading(!voteStatus);
  }, [voteStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium bg-gray-200 text-gray-600 px-3 py-1 rounded-full shadow-sm">
        <Loader className="h-4 w-4 animate-spin" />
        <span>Loading votes...</span>
      </div>
    );
  }

  if (!voteStatus) return null;

  // Format the reset date
  const formatResetDate = () => {
    if (!voteStatus.votes_reset_at) return '';
    
    const resetDate = new Date(voteStatus.votes_reset_at);
    const now = new Date();
    const diffTime = resetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    return `in ${diffDays} days`;
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 text-sm font-medium bg-blue-600 text-white px-3 py-1 rounded-full shadow-sm">
        🗳️ {voteStatus.votes_remaining > 0
          ? `${voteStatus.votes_remaining} votes remaining`
          : "You've used all your votes"}
        <button
          onClick={() => setShowTooltip(!showTooltip)}
          className="text-white hover:text-yellow-200 transition"
          aria-label="Voting information"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
      
      {/* Reset information */}
      {voteStatus.votes_remaining < voteStatus.weekly_vote_limit && (
        <div className="absolute -bottom-5 left-0 right-0 text-center">
          <span className="text-xs text-gray-500">
            Resets {formatResetDate()}
          </span>
        </div>
      )}
      
      <VotingInfoTooltip 
        show={showTooltip}
        onClose={() => setShowTooltip(false)}
      />
    </div>
  );
}