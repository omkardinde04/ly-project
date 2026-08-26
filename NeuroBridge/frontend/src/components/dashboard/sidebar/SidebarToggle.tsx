import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function SidebarToggle({ isCollapsed, onToggle, className = '' }: SidebarToggleProps) {
  const label = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      aria-label={label}
      title={label}
      className={`group relative w-7 h-7 rounded-full bg-white border border-blue-200 shadow-md hover:shadow-lg hover:border-[#2563EB] text-[#64748B] hover:text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:ring-offset-1 flex items-center justify-center z-50 cursor-pointer ${className}`}
    >
      <motion.div
        animate={{ rotate: isCollapsed ? 180 : 0 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="flex items-center justify-center"
      >
        <ChevronLeft size={15} strokeWidth={2.5} />
      </motion.div>
    </motion.button>
  );
}
