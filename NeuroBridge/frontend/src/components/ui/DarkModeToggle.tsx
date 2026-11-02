import { Moon, Sun } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';

export function DarkModeToggle({ className = '' }: { className?: string }) {
  const { isDarkMode, toggleDarkMode } = useDyslexia();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-pressed={isDarkMode}
      className={`relative inline-flex items-center justify-center w-10 h-8 rounded-xl border text-sm shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 ${
        isDarkMode
          ? 'bg-slate-800 border-slate-600 text-amber-300 hover:bg-slate-700 hover:border-slate-500'
          : 'bg-white/95 border-blue-100/90 text-indigo-600 hover:border-blue-200 hover:bg-blue-50/60'
      } ${className}`}
      aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
