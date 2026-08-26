import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import type { User } from '../../../contexts/AuthContext';

interface SidebarUserCardProps {
  user: User | null;
  isCollapsed: boolean;
  onNavigateProfile: () => void;
  onLogout: () => void;
}

export function SidebarUserCard({
  user,
  isCollapsed,
  onNavigateProfile,
  onLogout,
}: SidebarUserCardProps) {
  const [showProfileTooltip, setShowProfileTooltip] = useState(false);
  const [showLogoutTooltip, setShowLogoutTooltip] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'OM';

  const displayName = user?.name || 'Omkar Dinde';

  return (
    <div className="shrink-0 p-3 pt-2 border-t border-slate-100/80 overflow-visible">
      {isCollapsed ? (
        <div className="flex flex-col items-center gap-2.5">
          {/* Profile Avatar Button */}
          <div className="relative">
            <motion.button
              type="button"
              onClick={onNavigateProfile}
              onMouseEnter={() => setShowProfileTooltip(true)}
              onMouseLeave={() => setShowProfileTooltip(false)}
              onFocus={() => setShowProfileTooltip(true)}
              onBlur={() => setShowProfileTooltip(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Profile: ${displayName}`}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-[#2563EB] font-black text-xs flex items-center justify-center border border-blue-200/80 shadow-xs hover:border-[#2563EB] transition-colors overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </motion.button>

            <AnimatePresence>
              {showProfileTooltip && (
                <motion.div
                  role="tooltip"
                  initial={{ opacity: 0, scale: 0.9, x: -4 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -4 }}
                  transition={{ duration: 0.15 }}
                  className="fixed left-[86px] bottom-16 z-50 px-3 py-1.5 rounded-xl bg-[#1A202C] text-white text-xs font-bold shadow-2xl whitespace-nowrap pointer-events-none flex flex-col border border-slate-700/80"
                >
                  <span>{displayName}</span>
                  <span className="text-[10px] text-slate-400 font-normal">Student Account</span>
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1A202C] rotate-45 border-l border-b border-slate-700/80" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout Button */}
          <div className="relative">
            <motion.button
              type="button"
              onClick={onLogout}
              onMouseEnter={() => setShowLogoutTooltip(true)}
              onMouseLeave={() => setShowLogoutTooltip(false)}
              onFocus={() => setShowLogoutTooltip(true)}
              onBlur={() => setShowLogoutTooltip(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              aria-label="Log Out"
              title="Log Out"
              className="p-2 text-[#94A3B8] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <LogOut size={16} />
            </motion.button>

            <AnimatePresence>
              {showLogoutTooltip && (
                <motion.div
                  role="tooltip"
                  initial={{ opacity: 0, scale: 0.9, x: -4 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -4 }}
                  transition={{ duration: 0.15 }}
                  className="fixed left-[86px] bottom-6 z-50 px-3 py-1.5 rounded-xl bg-[#1A202C] text-white text-xs font-bold shadow-2xl whitespace-nowrap pointer-events-none flex items-center border border-slate-700/80"
                >
                  <span>Log Out</span>
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1A202C] rotate-45 border-l border-b border-slate-700/80" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div
          onClick={onNavigateProfile}
          className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-[#2563EB] font-black text-sm flex items-center justify-center shrink-0 border border-blue-100 overflow-hidden shadow-xs">
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="font-extrabold text-[#1A202C] text-xs truncate group-hover:text-[#2563EB] transition-colors">
              {displayName}
            </div>
            <div className="text-[11px] font-medium text-[#64748B] truncate">
              Student Account
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLogout();
            }}
            title="Log Out"
            aria-label="Log Out"
            className="p-1.5 text-[#94A3B8] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
