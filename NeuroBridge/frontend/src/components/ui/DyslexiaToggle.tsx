import React from 'react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { Type } from 'lucide-react';

export function DyslexiaToggle({ className = '' }: { className?: string }) {
  const { isDyslexiaMode, toggleDyslexiaMode } = useDyslexia();

  return (
    <div
      className={`flex items-center gap-2 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-2xs border border-blue-100/90 hover:border-blue-200 transition-all ${className}`}
      role="group"
      aria-label="Dyslexia Font Accessibility Switch"
    >
      <div className="flex items-center gap-1 text-xs font-bold text-[#1A202C]">
        <Type size={13} className="text-[#8B5CF6]" />
        <span className="hidden xl:inline">Dyslexia</span>
      </div>

      <button
        onClick={toggleDyslexiaMode}
        type="button"
        className={`relative w-8 h-4.5 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer ${
          isDyslexiaMode ? 'bg-[#2563EB]' : 'bg-slate-300'
        }`}
        aria-label="Toggle OpenDyslexic Mode"
        aria-pressed={isDyslexiaMode}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-xs transition-transform duration-300 ${
            isDyslexiaMode ? 'translate-x-3.5' : 'translate-x-0'
          }`}
        />
      </button>

      {isDyslexiaMode && (
        <span className="text-[9px] font-black text-[#2563EB] bg-blue-50 px-1 py-0.2 rounded hidden sm:inline">
          ON
        </span>
      )}
    </div>
  );
}
