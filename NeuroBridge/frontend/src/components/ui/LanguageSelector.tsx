import React from 'react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { Globe, ChevronDown } from 'lucide-react';

export function LanguageSelector({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useDyslexia();

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="relative">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'mr')}
          className="appearance-none bg-white/95 border border-blue-100/90 text-[#1A202C] pl-7 pr-7 py-1 rounded-xl text-[10px] font-bold shadow-2xs hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors cursor-pointer"
          aria-label="Select language"
        >
          <option value="en">EN</option>
          <option value="hi">HI</option>
          <option value="mr">MR</option>
        </select>
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#2563EB]">
          <Globe size={13} />
        </div>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]">
          <ChevronDown size={13} />
        </div>
      </div>
    </div>
  );
}
