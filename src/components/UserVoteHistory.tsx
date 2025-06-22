import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Loader, ThumbsUp, ThumbsDown, AlertTriangle, ListX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type VoteHistoryItem = {
  idea_id: string;
  idea_title: string;
  vote_type: 'up' | 'down';
  voted_at: string;
};

type UserVoteHistoryProps = {
  userId: string;
  onClose?: () => void;
};

export default function UserVoteHistory({ userId, onClose }: UserVoteHistoryProps) {
  const [history, setHistory] = useState<VoteHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) {
        setLoading(false);
        setError("User ID is not available.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data, error: rpcError } = await supabase.rpc('get_user_vote_history', {
          p_user_id: userId,
        });

        if (rpcError) throw rpcError;
        setHistory(data || []);
      } catch (err: unknown) {
        console.error('Error fetching vote history:', err);
        const message = err instanceof Error ? err.message : 'Failed to load vote history.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  if (loading) {
    return (
      <motion.div 
        className="flex justify-center items-center py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-3 text-gray-600">Loading vote history...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="my-8 p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AlertTriangle className="h-6 w-6 mr-2" />
        <p>{error}</p>
      </motion.div>
    );
  }

  if (history.length === 0) {
    return (
      <motion.div 
        className="my-8 py-10 text-center text-gray-500 flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ListX className="h-12 w-12 mb-4 text-gray-400" />
        <p className="text-lg">No votes cast yet</p>
        <p className="text-sm mt-2">When you vote on ideas, they'll appear here.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Vote History</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {history.map((vote, index) => (
              <motion.div
                key={`${vote.idea_id}-${vote.voted_at}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-grow">
                    <h4 className="text-lg font-medium text-gray-900 mb-1">
                      {vote.idea_title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {new Date(vote.voted_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                    vote.vote_type === 'up' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {vote.vote_type === 'up' ? (
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}