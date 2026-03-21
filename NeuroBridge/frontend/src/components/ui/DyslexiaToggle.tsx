import { useDyslexia } from '../../contexts/DyslexiaContext';

export function DyslexiaToggle({ className = '' }: { className?: string }) {
  const { isDyslexiaMode, toggleDyslexiaMode } = useDyslexia();

  return (
    <div className={`flex items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-2.5 rounded-full shadow-sm border border-blue-100/50 ${className}`}>
      <span className="text-sm font-bold text-gray-700 select-none">🎨 Dyslexia Mode</span>
      <button
        onClick={toggleDyslexiaMode}
        type="button"
        className={`w-12 h-6 rounded-full transition-colors relative focus:outline-hidden focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${
          isDyslexiaMode ? 'bg-blue-500' : 'bg-gray-300'
        }`}
        aria-label="Toggle Dyslexia Mode"
      >
        <div
          className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-sm ${
            isDyslexiaMode ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
