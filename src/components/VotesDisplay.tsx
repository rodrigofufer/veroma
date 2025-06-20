import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
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
      <div className="flex items-center gap-2 text-sm font-medium bg-gray-200 text-gray-600 px-3 py-1 rounded-full shadow-sm animate-pulse">
        Loading votes...
      </div>
    );
  }

  if (!voteStatus) return null;

  return (
    <div className="flex items-center gap-2 text-sm font-medium bg-blue-600 text-white px-3 py-1 rounded-full shadow-sm">
      🗳️ {voteStatus.votes_remaining > 0
        ? `${voteStatus.votes_remaining} votes remaining`
        : "You've used all your votes this week"}
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="text-white hover:text-yellow-200 transition"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      <VotingInfoTooltip 
        show={showTooltip}
        onClose={() => setShowTooltip(false)}
      />
    </div>
  );
}