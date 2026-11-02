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
          className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 pl-7 pr-7 py-1 rounded-xl text-[10px] font-bold shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors cursor-pointer"
          aria-label="Select language"
        >
          <option value="en" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">EN</option>
          <option value="hi" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">HI</option>
          <option value="mr" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">MR</option>
        </select>
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#2563EB] dark:text-blue-400">
          <Globe size={13} />
        </div>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown size={13} />
        </div>
      </div>
    </div>
  );
}
