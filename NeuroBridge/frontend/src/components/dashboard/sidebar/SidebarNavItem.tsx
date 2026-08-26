import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface SidebarNavItemProps {
  id: string;
  label: string;
  tooltipDescription?: string;
  icon: LucideIcon;
  isActive: boolean;
  badge?: string;
  isCollapsed: boolean;
  onClick: () => void;
}

export function SidebarNavItem({
  id,
  label,
  tooltipDescription,
  icon: Icon,
  isActive,
  badge,
  isCollapsed,
  onClick,
}: SidebarNavItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const showTooltip = isCollapsed && (isHovered || isFocused);

  // Formulate rich tooltip text
  const tooltipText = tooltipDescription || (badge ? `${label} · ${badge}` : label);

  return (
    <li className="relative list-none my-1">
      <motion.button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        whileTap={{ scale: 0.98 }}
        aria-current={isActive ? 'page' : undefined}
        aria-label={isCollapsed ? tooltipText : undefined}
        className={`group relative w-full font-bold outline-none cursor-pointer flex items-center transition-colors ${
          isCollapsed
            ? `h-11 w-11 mx-auto justify-center rounded-2xl focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/25'
                  : 'text-[#64748B] hover:bg-blue-50/80 hover:text-[#2563EB]'
              }`
            : `min-h-[48px] px-3.5 py-2.5 rounded-2xl justify-between focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/25'
                  : 'text-[#1A202C] hover:bg-blue-50/70 hover:text-[#2563EB]'
              }`
        }`}
      >
        <div className={`flex items-center gap-3 min-w-0 flex-1 ${isCollapsed ? 'justify-center' : ''}`}>
          {/* Active subtle indicator dot on expanded rows */}
          {!isCollapsed && isActive && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-1.5 h-1.5 rounded-full bg-white shadow-xs shrink-0 -ml-0.5"
            />
          )}

          <Icon
            size={19}
            strokeWidth={isActive ? 2.4 : 2}
            className={`shrink-0 transition-colors ${
              isActive ? 'text-white' : 'text-[#64748B] group-hover:text-[#2563EB]'
            }`}
            aria-hidden="true"
          />

          {/* Smooth Text Label Animation */}
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0, x: -8 }}
                animate={{ opacity: 1, width: 'auto', x: 0 }}
                exit={{ opacity: 0, width: 0, x: -8 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className="text-sm font-bold truncate leading-none overflow-hidden whitespace-nowrap text-left"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Badge Capsule smoothly animated in Expanded Mode */}
        <AnimatePresence initial={false}>
          {!isCollapsed && badge && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-50 text-[#2563EB] border border-blue-100'
              }`}
            >
              {badge}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Accessible Floating Tooltip in Collapsed Dock Mode */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, scale: 0.9, x: -4 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -4 }}
            transition={{ duration: 0.15 }}
            className="fixed left-[86px] z-50 px-3 py-1.5 rounded-xl bg-[#1A202C] text-white text-xs font-bold shadow-2xl whitespace-nowrap pointer-events-none flex items-center gap-2 border border-slate-700/80"
            style={{
              transform: 'translateY(-50%)',
            }}
          >
            <span>{label}</span>
            {badge && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-[#2563EB] text-white">
                {badge}
              </span>
            )}
            {/* Tooltip Arrow Pointer */}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1A202C] rotate-45 border-l border-b border-slate-700/80" />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
