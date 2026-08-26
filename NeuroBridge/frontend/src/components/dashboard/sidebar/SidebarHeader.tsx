import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarToggle } from './SidebarToggle';
import { LogoIcon } from '../../ui/LogoIcon';
import { X } from 'lucide-react';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggle: () => void;
  platformSubtitle?: string;
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

export function SidebarHeader({
  isCollapsed,
  onToggle,
  platformSubtitle = 'Learning Platform',
  onCloseMobile,
  isMobile = false,
}: SidebarHeaderProps) {
  return (
    <div className="relative shrink-0 pt-6 pb-4 px-4 overflow-visible">
      {/* Floating Edge Toggle Button on Desktop */}
      {!isMobile && (
        <div className="absolute -right-3.5 top-7 z-50">
          <SidebarToggle isCollapsed={isCollapsed} onToggle={onToggle} />
        </div>
      )}

      {/* Main Logo & Wordmark Area */}
      <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo Mark */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform duration-300">
            <LogoIcon className="w-full h-full" />
          </div>

          {/* Wordmark & Subtitle smoothly animated in Expanded Mode */}
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0, x: -10 }}
                animate={{ opacity: 1, width: 'auto', x: 0 }}
                exit={{ opacity: 0, width: 0, x: -10 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="min-w-0 flex-1 overflow-hidden whitespace-nowrap"
              >
                <div className="font-extrabold text-[#1A202C] text-lg tracking-tight leading-none truncate">
                  NeuroBridge
                </div>
                <div className="text-[11px] font-semibold text-[#64748B] mt-1 truncate">
                  {platformSubtitle}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Close Button */}
        {isMobile && onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#1A202C] hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
