import { useDyslexia } from '../../contexts/DyslexiaContext';
import { CHAPTERS } from './landingConfig';

/** Vertical section-jump dots pinned to the right edge (desktop). */
export function ChapterDots({ activeIndex, onJump }: { activeIndex: number; onJump: (index: number) => void }) {
  const { isDarkMode } = useDyslexia();
  return (
    <nav
      aria-label="Landing page sections"
      className="pointer-events-auto absolute right-6 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 xl:right-8"
    >
      {CHAPTERS.map((c, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onJump(i)}
            aria-label={`Go to ${c.label}`}
            aria-current={isActive ? 'step' : undefined}
            title={c.label}
            className={`w-2 rounded-full cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 ${
              isDarkMode ? 'focus-visible:ring-offset-[#0B1120]' : 'focus-visible:ring-offset-white'
            } ${
              isActive
                ? 'h-7 bg-[#2563EB]'
                : isDarkMode
                  ? 'h-2 bg-slate-600 hover:bg-slate-400'
                  : 'h-2 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        );
      })}
    </nav>
  );
}
