import { useDyslexia } from '../../contexts/DyslexiaContext';
import { CHAPTERS, CHARACTER_SRC, fallbackOnError } from './landingConfig';

/**
 * Compact companion for screens below the desktop breakpoint.
 * A slim sticky strip (avatar + current section) that sits under the navbar
 * while the sections scroll, and releases at the end of the content column —
 * it never floats over buttons or the footer.
 */
export function MobileCompanion({ activeIndex }: { activeIndex: number }) {
  const { isDarkMode } = useDyslexia();
  const chapter = CHAPTERS[activeIndex] ?? CHAPTERS[0];

  return (
    <div
      className={`lg:hidden sticky top-[4.5rem] z-30 px-4 sm:px-6 py-2 backdrop-blur-md border-b ${
        isDarkMode ? 'bg-[#0B1120]/90 border-slate-800' : 'bg-white/90 border-slate-200/80'
      }`}
    >
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        {/* Head-and-shoulders crop of the same three renders */}
        <div
          aria-hidden
          className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-full border ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-200'
          }`}
        >
          {(['front', 'left', 'right'] as const).map((p) => (
            <img
              key={p}
              src={CHARACTER_SRC[p]}
              alt=""
              width={686}
              height={1024}
              decoding="async"
              draggable={false}
              onError={fallbackOnError(p)}
              className="absolute left-1/2 top-[-6px] h-[160px] w-auto max-w-none -translate-x-1/2"
              style={{
                opacity: p === chapter.pose ? 1 : 0,
                transition: 'none',
              }}
            />
          ))}
        </div>
        <div className="min-w-0 flex-1" aria-live="polite">
          <div className={`text-[10px] font-bold uppercase tracking-[0.16em] ${isDarkMode ? 'text-blue-300' : 'text-[#2563EB]'}`}>
            {String(activeIndex + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}
          </div>
          <div className={`truncate text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            {chapter.label}
          </div>
        </div>
        <div className="flex gap-1" aria-hidden>
          {CHAPTERS.map((c, i) => (
            <span
              key={c.id}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? 'w-4 bg-[#2563EB]' : isDarkMode ? 'w-1.5 bg-slate-700' : 'w-1.5 bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
