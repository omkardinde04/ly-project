import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { CharacterFigure } from './CharacterFigure';
import { CHAPTERS, CHARACTER_COLUMN, DROP_IN, SHADOW_IN, TINT_COLORS, popIn } from './landingConfig';
import { useCharacterWalk } from './useCharacterWalk';

/**
 * Full-width desktop character stage. Rendered once, inside a sticky layer that
 * sits BEHIND the content. The character stands in the half of the screen not
 * used by the current section and walks across to the other half as the
 * visitor scrolls (scroll-linked, reversible). Driven only by the active
 * chapter index + scroll position — it knows nothing about the content.
 */
export function PersistentCharacter({ activeIndex }: { activeIndex: number }) {
  const { isDarkMode, reduceMotion, isDyslexiaMode } = useDyslexia();
  const chapter = CHAPTERS[activeIndex] ?? CHAPTERS[0];
  const calm = reduceMotion || isDyslexiaMode;
  const tint = TINT_COLORS[chapter.tint][isDarkMode ? 'dark' : 'light'];
  const stageRef = useRef<HTMLDivElement>(null);
  const walk = useCharacterWalk(stageRef, !calm);
  const wash = isDarkMode ? '#0F1A33' : '#EEF4FF';
  const columnWidth = `${CHARACTER_COLUMN * 100}%`;

  return (
    <div ref={stageRef} className="relative h-full w-full select-none overflow-hidden">
      {/* ── Soft wash on whichever half the character occupies ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {(['left', 'right'] as const).map((side) => (
          <div
            key={side}
            className="absolute inset-y-0"
            style={{
              [side]: 0,
              width: columnWidth,
              background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, ${wash} 0%, ${wash} 55%, transparent 100%)`,
              opacity: chapter.side === side ? 1 : 0,
              transition: calm ? 'none' : 'opacity 700ms ease',
            }}
          />
        ))}
      </div>

      {/* ── Walking group: everything here travels with the character ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[4%] top-[calc(4.5rem+10%)] flex justify-center">
        <motion.div className="relative flex h-full items-end justify-center" style={{ x: walk.x }}>
          {/* Tinted halo + rings behind him */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-[52%] aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            initial={calm ? false : popIn(0.45).initial}
            animate={{ backgroundColor: tint, scale: 1, opacity: 1 }}
            transition={{
              backgroundColor: { duration: calm ? 0 : 0.9, ease: 'easeInOut' },
              ...(calm ? {} : { scale: popIn(0.45).transition, opacity: popIn(0.45).transition }),
            }}
          />
          <motion.div
            {...(calm ? {} : popIn(0.55))}
            aria-hidden
            className={`absolute left-1/2 top-[50%] aspect-square w-[108%] -translate-x-1/2 -translate-y-1/2 rounded-full border ${
              isDarkMode ? 'border-blue-400/15' : 'border-[#2563EB]/10'
            }`}
          />
          <motion.div
            {...(calm ? {} : popIn(0.65))}
            aria-hidden
            className={`absolute left-1/2 top-[50%] aspect-square w-[136%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed ${
              isDarkMode ? 'border-blue-400/10' : 'border-[#2563EB]/[0.07]'
            }`}
          />
          {/* Contact shadow — stays on the floor during the step-bob; grows as he lands on page load */}
          <motion.div
            {...(calm ? {} : SHADOW_IN)}
            aria-hidden
            className={`absolute -bottom-[0.6%] left-1/2 h-7 w-[56%] -translate-x-1/2 rounded-[100%] blur-md ${
              isDarkMode ? 'bg-black/50' : 'bg-slate-900/15'
            }`}
          />

          {/* Section caption, carried above his head */}
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 text-center" aria-live="polite">
            <div
              className={`text-[11px] font-bold uppercase tracking-[0.18em] ${
                isDarkMode ? 'text-blue-300/80' : 'text-[#2563EB]/80'
              }`}
            >
              {String(activeIndex + 1).padStart(2, '0')}{' '}
              <span className="opacity-50">/ {String(CHAPTERS.length).padStart(2, '0')}</span>
            </div>
            <div className="relative mt-1 h-6 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={chapter.id}
                  initial={calm ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={calm ? { opacity: 0 } : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className={`text-sm font-semibold whitespace-nowrap ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}
                >
                  {chapter.label}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* The character: per-section settle (lift/scale) → step-bob → idle float */}
          <motion.div
            className="relative flex h-full items-end justify-center"
            style={{ transformOrigin: '50% 100%' }}
            animate={{ y: chapter.lift, scale: chapter.scale }}
            transition={calm ? { duration: 0 } : { type: 'spring', stiffness: 70, damping: 18, mass: 0.9 }}
          >
            {/* Page-load entrance: drops in and bounces on the floor */}
            <motion.div className="h-full" style={{ transformOrigin: '50% 100%' }} {...(calm ? {} : DROP_IN)}>
            <motion.div className="h-full" style={{ y: walk.y }}>
              <div className={`h-full ${calm ? '' : 'nb-idle-float'}`}>
                <CharacterFigure
                  pose={walk.pose}
                  instant={reduceMotion}
                  className={`h-full max-h-[860px] ${
                    isDarkMode
                      ? 'drop-shadow-[0_24px_40px_rgba(2,6,23,0.55)]'
                      : 'drop-shadow-[0_24px_36px_rgba(30,58,138,0.16)]'
                  }`}
                  label="NeuroBridge student guide holding a reading ruler"
                />
              </div>
            </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
