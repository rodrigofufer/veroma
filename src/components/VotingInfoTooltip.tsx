import React from 'react';
import { HelpCircle } from 'lucide-react';
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
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Weekly Voting System</h4>
          <ul className="text-xs text-gray-600 space-y-2">
            <li>• You receive 10 votes every week</li>
            <li>• Votes reset every Monday at 00:00 UTC</li>
            <li>• Use votes to support or oppose ideas</li>
            <li>• You can change or remove your vote</li>
          </ul>
          <button
            onClick={onClose}
            className="mt-3 text-xs text-blue-600 hover:text-blue-800"
          >
            Got it
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}