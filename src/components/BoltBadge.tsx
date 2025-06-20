import React from 'react';
import { motion } from 'framer-motion';

export default function BoltBadge() {
  return (
    <motion.a
      href="https://bolt.new"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 transition-transform hover:scale-105"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <img 
        src="/black_circle_360x360.png"
        alt="Built on Bolt"
        className="h-12 w-12 md:h-16 md:w-16 rounded-full shadow-lg"
      />
    </motion.a>
  );
}