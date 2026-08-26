import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarToggle } from './SidebarToggle';
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
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] p-2 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
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
