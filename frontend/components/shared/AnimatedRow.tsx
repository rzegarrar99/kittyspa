import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedRowProps {
  children: React.ReactNode;
  index: number;
  className?: string;
}

export const AnimatedRow: React.FC<AnimatedRowProps> = ({ children, index, className = '' }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`hover:bg-white/40 transition-colors group ${className}`}
    >
      {children}
    </motion.tr>
  );
};
