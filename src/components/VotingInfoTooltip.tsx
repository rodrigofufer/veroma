import React from 'react';
import { Calendar, Vote, RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type VotingInfoTooltipProps = {
  show: boolean;
  onClose: () => void;
};

export default function VotingInfoTooltip({ show, onClose }: VotingInfoTooltipProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute z-50 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <Vote className="h-4 w-4 text-blue-600 mr-1.5" />
            Weekly Voting System
          </h4>
          <ul className="text-xs text-gray-600 space-y-2">
            <li className="flex items-start">
              <Calendar className="h-3.5 w-3.5 text-blue-500 mt-0.5 mr-1.5 flex-shrink-0" />
              You receive 10 votes every week
            </li>
            <li className="flex items-start">
              <RefreshCw className="h-3.5 w-3.5 text-blue-500 mt-0.5 mr-1.5 flex-shrink-0" />
              Votes reset every Monday at 00:00 UTC
            </li>
            <li className="flex items-start">
              <Check className="h-3.5 w-3.5 text-blue-500 mt-0.5 mr-1.5 flex-shrink-0" />
              Support or oppose ideas with your votes
            </li>
            <li className="flex items-start">
              <Check className="h-3.5 w-3.5 text-blue-500 mt-0.5 mr-1.5 flex-shrink-0" />
              You can change or remove your vote anytime
            </li>
          </ul>
          <button
            onClick={onClose}
            className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Got it
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}