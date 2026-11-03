import React, { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { GreatCompany } from '../sections/GreatCompany';
import { PersistentCharacter } from '../landing/PersistentCharacter';
import { MobileCompanion } from '../landing/MobileCompanion';
import { ChapterDots } from '../landing/ChapterDots';
import { useActiveChapter } from '../landing/useActiveChapter';
import { CHAPTERS, CHAPTER_IDS } from '../landing/landingConfig';
import {
  AccessibilityChapter,
  CommunityChapter,
  ExtensionChapter,
  HeroChapter,
  HowItWorksChapter,
  JarvisChapter,
  PlatformChapter,
} from '../landing/LandingChapters';

/**
 * Landing page.
 *
 * Desktop (lg+): a zig-zag story. The persistent character starts on the LEFT
 * with the hero content on the right; at every following section he walks
 * across to the other half while that section's content appears opposite him.
 *
 * Below lg: one column, the character stacks inside the hero and a compact
 * sticky companion strip follows the reader through the chapters.
 */
export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, reduceMotion, isDyslexiaMode } = useDyslexia();
  const activeIndex = useActiveChapter(CHAPTER_IDS);

  // Thin page progress bar (motion value only — no React re-renders on scroll)
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { damping: 25, stiffness: 100 });

  const jumpTo = useCallback(
    (index: number) => {
      const el = document.getElementById(CHAPTERS[index].id);
      el?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    },
    [reduceMotion],
  );

  // Support deep links such as /#community-section
  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  }, [location.hash]);

  // Mouse spotlight for the final CTA card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.06), transparent 40%)`;
  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    if (reduceMotion || isDyslexiaMode) return;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div className={`w-full relative -mt-[4.5rem] transition-colors duration-500 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'}`}>
      {!reduceMotion && !isDyslexiaMode && (
        <motion.div
          aria-hidden
          style={{ scaleX: smoothProgress, transformOrigin: '0%' }}
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-emerald-400 z-50 pointer-events-none"
        />
      )}

      {/* ─── ZIG-ZAG SCROLL STORY ───────────────────────────────────────────
          Three stacked layers spanning the same height:
          The page starts at the very top of the screen, underneath the
          transparent navbar, so the stage's soft wash runs up behind it.
          1. (behind)  sticky full-width stage with the one persistent character
          2. (middle)  full-width sections; each puts its content in the half
                       the character is NOT standing in (alternating sides)
          3. (front)   sticky section-jump dots
          The sticky layers end with the story, so they never cover the rest
          of the page or the footer. */}
      <div className="relative">
        <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none">
          <div className="sticky top-0 h-svh">
            <PersistentCharacter activeIndex={activeIndex} />
          </div>
        </div>

        <div className="relative z-10">
          <HeroChapter />
          <MobileCompanion activeIndex={activeIndex} />
          {/* Wrapper id kept for the JARVIS "features" tour */}
          <div id="features-section">
            <PlatformChapter />
            <JarvisChapter />
            <AccessibilityChapter />
            <ExtensionChapter />
          </div>
          <HowItWorksChapter />
          <CommunityChapter />
        </div>

        <div className="hidden lg:block absolute inset-0 z-20 pointer-events-none">
          <div className="sticky top-0 h-svh">
            <ChapterDots activeIndex={activeIndex} onJump={jumpTo} />
          </div>
        </div>
      </div>

      {/* ─── HAND-OFF TO THE REST OF THE PAGE (FULL WIDTH) ─── */}
      <div className={`w-full border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 space-y-20 sm:space-y-24">
          <div id="great-company-section" className="scroll-mt-[4.5rem]">
            <GreatCompany />
          </div>

          <div id="cta-section" className="scroll-mt-[4.5rem]">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              onMouseMove={handleMouseMove}
              className={`group rounded-3xl sm:rounded-[36px] border p-8 sm:p-12 lg:p-14 text-center space-y-6 relative overflow-hidden ${
                isDarkMode
                  ? 'bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] border-slate-800 shadow-xl'
                  : 'bg-gradient-to-br from-[#1E3A8A] via-[#1E293B] to-[#0F172A] border-blue-900 shadow-xl'
              }`}
            >
              {!reduceMotion && !isDyslexiaMode && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: spotlight }}
                />
              )}
              <div aria-hidden className="absolute -top-24 -left-20 w-72 h-72 bg-blue-600/15 blur-[90px] rounded-full pointer-events-none" />
              <div aria-hidden className="absolute -bottom-32 -right-24 w-96 h-96 bg-purple-600/15 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-900/40 text-blue-200 border border-blue-500/30 text-xs font-bold">
                <Sparkles size={14} className="text-blue-300" />
                <span>Empowering Every Mind</span>
              </div>

              <h2
                className="relative font-black tracking-tight max-w-2xl mx-auto"
                style={{ color: '#FFFFFF', fontSize: 'clamp(1.875rem, 1.3rem + 1.6vw, 3rem)', lineHeight: 1.15 }}
              >
                Your learning starts here.
              </h2>

              <p className="relative text-sm sm:text-base text-blue-100 font-medium leading-relaxed max-w-xl mx-auto">
                Take a 5-minute test, get the Chrome helper, play games and learn your way.
              </p>

              <div className="relative flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/assessment')}
                  className="px-8 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-sm shadow-md shadow-blue-500/25 border border-blue-400/20 transition-all flex items-center gap-2 cursor-pointer group/btn hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E293B]"
                >
                  <span>Take the test</span>
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/learn')}
                  className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E293B]"
                >
                  Play games
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
