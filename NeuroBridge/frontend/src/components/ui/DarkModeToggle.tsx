import React from 'react';
import { useDyslexia } from '../../contexts/DyslexiaContext';

export function DarkModeToggle({ className = '' }: { className?: string }) {
  const { isDarkMode, toggleDarkMode } = useDyslexia();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className={`relative inline-flex items-center justify-center w-10 h-8 rounded-xl bg-white/95 border border-blue-100/90 text-sm shadow-2xs hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all cursor-pointer ${className}`}
      aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span className="transform transition-transform duration-300">
        {isDarkMode ? '☀️' : '🌙'}
      </span>
    </button>
  );
}
