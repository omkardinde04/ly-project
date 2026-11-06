import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  Chrome,
  Download,
  Eye,
  Gamepad2,
  Layers,
  Lightbulb,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Type,
  UserCheck,
  Users,
  Volume2,
} from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { CharacterFigure } from './CharacterFigure';
import { CHAPTERS, DROP_IN, popIn } from './landingConfig';

/* ──────────────────────────────────────────────────────────────────────────
   Shared building blocks
────────────────────────────────────────────────────────────────────────── */

function useTone() {
  const { isDarkMode } = useDyslexia();
  return {
    isDarkMode,
    body: isDarkMode ? 'text-slate-300' : 'text-slate-600',
    strong: isDarkMode ? 'text-slate-200' : 'text-slate-700',
    title: isDarkMode ? 'text-white' : 'text-slate-900',
    muted: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    card: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs',
    inset: isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200',
    chip: isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-50 text-slate-600 border-slate-200',
    divider: isDarkMode ? 'border-slate-800' : 'border-slate-200',
  };
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2';

const primaryBtn = `px-7 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-blue-500/35 transition-all inline-flex items-center gap-2 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${focusRing}`;

function secondaryBtn(isDarkMode: boolean) {
  return `px-7 py-3.5 rounded-2xl font-bold text-sm transition-all border shadow-2xs inline-flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${focusRing} ${
    isDarkMode
      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
  }`;
}

const H2_STYLE = { fontSize: 'clamp(1.875rem, 1.35rem + 1.3vw, 2.6rem)', lineHeight: 1.15 } as const;

type PillTone = 'blue' | 'purple' | 'emerald';

function Eyebrow({ icon, children, tone = 'blue' }: { icon: ReactNode; children: ReactNode; tone?: PillTone }) {
  const tones: Record<PillTone, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-semibold ${tones[tone]}`}>
      {icon}
      <span>{children}</span>
    </div>
  );
}

/**
 * Full-width row for one step of the zig-zag story. The content takes the
 * half of the screen the character is NOT standing in (from landingConfig),
 * so on desktop the sections alternate: content right, left, right, …
 * The empty half is where the persistent character walks to. Below lg it is
 * a plain single column.
 */
function SplitRow({
  id,
  label,
  padY,
  minH = 'lg:min-h-[calc(100svh-4.5rem)]',
  children,
}: {
  id: string;
  label: string;
  padY: string;
  /** Desktop min-height of the row. */
  minH?: string;
  children: ReactNode;
}) {
  const index = CHAPTERS.findIndex((c) => c.id === id);
  const contentRight = CHAPTERS[index]?.side === 'left';
  return (
    <section id={id} aria-label={label} className="relative scroll-mt-[8rem] lg:scroll-mt-[4.5rem]">
      <div
        className={`lg:grid ${minH} ${
          contentRight ? 'lg:grid-cols-[46fr_54fr]' : 'lg:grid-cols-[54fr_46fr]'
        }`}
      >
        <div
          className={`@container min-w-0 flex flex-col justify-center px-4 sm:px-6 lg:px-12 xl:px-16 ${padY} ${
            contentRight ? 'lg:col-start-2 lg:pr-20 xl:pr-24' : 'lg:col-start-1'
          }`}
        >
          <div data-chapter-content className="mx-auto w-full max-w-2xl lg:max-w-[42rem]">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** A content chapter: section number marker + content that slides in from its own side. */
function Chapter({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  const { isDarkMode, reduceMotion } = useDyslexia();
  const index = CHAPTERS.findIndex((c) => c.id === id);
  const fromRight = CHAPTERS[index]?.side === 'left';
  return (
    <SplitRow id={id} label={label} padY="py-16 sm:py-20 lg:py-32">
      <div
        aria-hidden
        className={`mb-6 flex items-center gap-3 text-xs font-bold tracking-[0.2em] ${
          isDarkMode ? 'text-slate-500' : 'text-slate-400'
        }`}
      >
        <span>{String(index + 1).padStart(2, '0')}</span>
        <span className={`h-px w-12 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
      </div>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: fromRight ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-12% 0px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="space-y-8"
      >
        {children}
      </motion.div>
    </SplitRow>
  );
}

function CheckList({ items }: { items: string[] }) {
  const t = useTone();
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm font-medium">
          <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
          <span className={t.strong}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   01 · Hero
────────────────────────────────────────────────────────────────────────── */

const PHRASES = ['for your goals.', 'for your brain.', 'for your future.', 'for every learner.', 'for you.'];

const HERO_STATS = [
  { value: '12,000+', label: 'Students helped', color: 'text-[#2563EB] dark:text-blue-400' },
  { value: '100%', label: 'Made for dyslexia', color: 'text-emerald-600 dark:text-emerald-400' },
  { value: '94%', label: 'Feel more confident', color: 'text-[#7C3AED] dark:text-purple-400' },
  { value: 'Chrome', label: 'Free reading helper', color: 'text-amber-600 dark:text-amber-400' },
];

export function HeroChapter() {
  const navigate = useNavigate();
  const t = useTone();
  const { reduceMotion, isDyslexiaMode, toggleDyslexiaMode } = useDyslexia();
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setPhraseIndex((i) => (i + 1) % PHRASES.length), 3200);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <SplitRow
      id="hero-section"
      label="Hero Section"
      minH="lg:min-h-svh"
      padY="pt-[6.5rem] pb-12 sm:pt-[7.5rem] lg:pt-[calc(4.5rem+4rem)] lg:pb-16"
    >
      <div className="space-y-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border ${
            t.isDarkMode ? 'bg-slate-800 text-amber-300 border-slate-700' : 'bg-blue-50 text-[#2563EB] border-blue-200/90 shadow-2xs'
          }`}
        >
          <Sparkles size={14} className={t.isDarkMode ? 'text-amber-400' : 'text-blue-600'} />
          <span>Made for dyslexic learners</span>
        </motion.div>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="font-black tracking-tight"
          style={{ fontSize: 'clamp(2.4rem, 1.4rem + 2.6vw, 4rem)', lineHeight: 1.1 }}
        >
          Learning should work{' '}
          <span className="grid mt-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={phraseIndex}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className="col-start-1 row-start-1 bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#9333EA] bg-clip-text text-transparent pb-1"
              >
                {PHRASES[phraseIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`text-base sm:text-lg leading-relaxed max-w-xl ${t.body}`}
        >
          Play brain games, take easy lessons and read any website with confidence.
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap items-center gap-3 sm:gap-4"
        >
          <button type="button" data-jarvis-id="hero-get-started" onClick={() => navigate('/assessment')} className={primaryBtn}>
            <span>Take the test</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            type="button"
            data-jarvis-id="hero-explore-features"
            onClick={() => navigate('/learn')}
            className={secondaryBtn(t.isDarkMode)}
          >
            <span>Play games</span>
            <Gamepad2 size={16} className="text-[#2563EB]" />
          </button>
        </motion.div>

        {/* Live dyslexia-mode switch (existing functionality, kept from the old workspace window) */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={toggleDyslexiaMode}
            aria-pressed={isDyslexiaMode}
            title="Turn Fun mode on or off"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer hover:scale-105 active:scale-95 ${focusRing} ${
              isDyslexiaMode
                ? 'bg-blue-50 text-[#2563EB] border-blue-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                : t.isDarkMode
                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-2xs'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isDyslexiaMode ? 'bg-[#2563EB] dark:bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{isDyslexiaMode ? '✨ Fun mode is on' : 'Fun mode: off'}</span>
          </button>
          <span className={`text-xs ${t.muted}`}>Easier font and more space between lines.</span>
        </div>
      </div>

      {/* Mobile / tablet: the character stacks under the copy instead of a side column */}
      <div className="lg:hidden relative mt-10 flex justify-center">
        <div
          aria-hidden
          className={`absolute bottom-0 left-1/2 aspect-square w-[80%] max-w-[380px] -translate-x-1/2 rounded-full blur-2xl ${
            t.isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'
          }`}
        />
        <motion.div
          className="relative"
          style={{ transformOrigin: '50% 100%' }}
          {...(reduceMotion ? {} : DROP_IN)}
        >
          <CharacterFigure
            pose="front"
            instant={reduceMotion}
            className="h-[min(52vh,420px)]"
            label="NeuroBridge student guide holding a reading ruler"
          />
        </motion.div>
      </div>

      <dl className="mt-10 grid grid-cols-2 @xl:grid-cols-4 gap-3">
        {HERO_STATS.map((s, i) => (
          <motion.div
            key={s.label}
            {...(reduceMotion ? {} : popIn(0.5 + i * 0.08))}
            className={`flex flex-col-reverse justify-end p-4 rounded-2xl border ${t.isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-2xs'}`}>
            <dt className={`text-xs mt-0.5 ${t.muted}`}>{s.label}</dt>
            <dd className={`text-lg sm:text-xl font-black leading-tight ${s.color}`}>{s.value}</dd>
          </motion.div>
        ))}
      </dl>
    </SplitRow>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   02 · Platform capabilities (games-section)
────────────────────────────────────────────────────────────────────────── */

const PILLARS = [
  {
    title: 'Play',
    subtitle: 'Brain games',
    desc: 'Fun games for memory, sounds and reading.',
    icon: Gamepad2,
    color: 'text-[#2563EB]',
    bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-900/60',
    badge: 'Games',
  },
  {
    title: 'Learn',
    subtitle: 'Easy lessons',
    desc: 'Short lessons with pictures and sound.',
    icon: BookOpen,
    color: 'text-[#7C3AED]',
    bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-900/60',
    badge: 'Lessons',
  },
  {
    title: 'Assess',
    subtitle: 'Quick test',
    desc: 'A 15-minute test finds what helps you read.',
    icon: UserCheck,
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-900/60',
    badge: 'Test',
  },
  {
    title: 'Extend',
    subtitle: 'Chrome helper',
    desc: 'Use your reading settings on any website.',
    icon: Chrome,
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-900/60',
    badge: 'After the test',
  },
];

const SOUNDWAVE = [18, 32, 22, 40, 26, 36, 20, 30, 16];

export function PlatformChapter() {
  const t = useTone();
  const { reduceMotion } = useDyslexia();

  return (
    <Chapter id="games-section" label="Core Capabilities">
      <div className="space-y-4">
        <Eyebrow icon={<Layers size={14} />}>What you can do</Eyebrow>
        <h2 className="font-black tracking-tight" style={H2_STYLE}>
          Everything you need in one place.
        </h2>
        <p className={`text-base sm:text-lg leading-relaxed max-w-2xl ${t.body}`}>
          Every tool fits the way you learn.
        </p>
      </div>

      <div className="grid grid-cols-1 @lg:grid-cols-2 gap-4">
        {PILLARS.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className={`group rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${t.card} ${
                t.isDarkMode ? 'hover:border-slate-700' : 'hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${p.bg} ${p.color}`}>
                  <Icon size={22} />
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${t.chip}`}>{p.badge}</span>
              </div>
              <h3 className="font-bold" style={{ fontSize: '1.2rem' }}>{p.title}</h3>
              <div className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 mt-0.5 mb-2">{p.subtitle}</div>
              <p className={`text-sm leading-relaxed ${t.body}`}>{p.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Learning Arena snapshot (from the original hero workspace) */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 grid grid-cols-1 @xl:grid-cols-[1.2fr_1fr] gap-5 items-center ${
          t.isDarkMode ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700/80' : 'bg-gradient-to-b from-white to-blue-50/50 border-blue-200 shadow-xs'
        }`}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-blue-400 flex items-center gap-1.5">
              <TrendingUp size={15} /> Learning Arena
            </span>
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
              🔥 7-Day Streak
            </span>
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className={`text-2xl sm:text-3xl font-black ${t.title}`}>84% Accuracy</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              +14% this week
            </span>
          </div>
          <div className={`text-sm mt-1 ${t.body}`}>Sound Lab and memory goals done</div>
          <div className={`mt-4 h-2.5 w-full rounded-full overflow-hidden p-0.5 border ${t.isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
            <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-emerald-500" />
          </div>
          <div className={`mt-1.5 flex justify-between text-[11px] font-medium ${t.muted}`}>
            <span>Focus Score: 780</span>
            <span className="text-[#2563EB] dark:text-blue-400 font-semibold">Milestone: Master</span>
          </div>
        </div>
        <div className={`rounded-xl border p-4 ${t.isDarkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-white border-blue-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#2563EB] dark:text-blue-400 flex items-center gap-1.5">
              <Volume2 size={13} /> Sound practice
            </span>
            <span className={`text-[10px] ${t.muted}`}>Lesson 4 · Active</span>
          </div>
          <div className="flex items-end justify-between h-11 px-1 pt-1" aria-hidden>
            {SOUNDWAVE.map((h, i) => (
              <motion.div
                key={i}
                animate={reduceMotion ? undefined : { height: [h * 0.6, h, h * 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse', delay: i * 0.12, ease: 'easeInOut' }}
                className="w-2 rounded-full bg-gradient-to-t from-[#2563EB] to-[#7C3AED]"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </Chapter>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   03 · JARVIS AI (courses-section)
────────────────────────────────────────────────────────────────────────── */

const JARVIS_CONVERSATIONS = [
  {
    topic: 'Make it short',
    user: 'Can you make this chapter short and easy?',
    intro: 'Here are the 3 main ideas:',
    bullets: [
      'Practice makes your brain stronger.',
      'Pictures and sound help you remember.',
      'Short 15-minute sessions work best.',
    ],
  },
  {
    topic: 'Chrome helper',
    user: 'How do I get the Chrome helper?',
    intro: 'It is easy:',
    bullets: [
      'Finish the 5-minute test.',
      'Download the Chrome helper.',
      'Your font and ruler now work on every website.',
    ],
  },
  {
    topic: 'Study tip',
    user: 'Long text is hard for me. What can I do?',
    intro: 'Try this:',
    bullets: [
      'Use the ruler to read one line at a time.',
      'Listen first, then read along.',
      'Take a 2-minute break.',
    ],
  },
];

function JarvisChat() {
  const t = useTone();
  const { reduceMotion } = useDyslexia();
  const [active, setActive] = useState(0);
  const current = JARVIS_CONVERSATIONS[active];

  return (
    <div className={`rounded-3xl border p-5 sm:p-6 space-y-4 ${t.card}`}>
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-3 border-b ${t.divider}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center justify-center">
            <Bot size={20} />
          </div>
          <div>
            <div className={`flex items-center gap-2 text-sm font-bold ${t.title}`}>
              JARVIS AI Study Guide <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className={`text-xs ${t.muted}`}>Your reading helper</span>
          </div>
        </div>
        <div role="tablist" aria-label="Example conversations" className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl">
          {JARVIS_CONVERSATIONS.map((c, i) => (
            <button
              key={c.topic}
              type="button"
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${focusRing} ${
                active === i
                  ? 'bg-white dark:bg-slate-700 text-[#2563EB] dark:text-blue-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {c.topic}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.topic}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-3 min-h-[200px] flex flex-col justify-end text-sm"
          role="tabpanel"
        >
          <div className="ml-auto max-w-[88%] bg-[#2563EB] text-white p-3.5 rounded-2xl rounded-tr-xs leading-relaxed">
            "{current.user}"
          </div>
          <div className={`mr-auto max-w-[94%] p-4 rounded-2xl rounded-tl-xs space-y-2.5 border ${t.inset}`}>
            <div className="flex items-center justify-between gap-3 text-xs font-semibold text-purple-700 dark:text-purple-300">
              <span>{current.intro}</span>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#2563EB] dark:text-blue-400 shrink-0">
                <Volume2 size={13} /> Listen
              </span>
            </div>
            <ul className={`space-y-1.5 pl-3 border-l-2 border-[#2563EB] ${t.strong}`}>
              {current.bullets.map((b) => (
                <li key={b} className="leading-relaxed">• {b}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function JarvisChapter() {
  const navigate = useNavigate();
  const t = useTone();

  return (
    <Chapter id="courses-section" label="Intelligent Study Companion">
      <div className="grid grid-cols-1 @3xl:grid-cols-[1fr_1.05fr] gap-8 items-center">
        <div className="space-y-5">
          <Eyebrow icon={<Bot size={15} />} tone="purple">Study helper</Eyebrow>
          <h2 className="font-black tracking-tight" style={H2_STYLE}>
            Meet JARVIS, your study helper.
          </h2>
          <p className={`text-base leading-relaxed ${t.body}`}>
            JARVIS reads text aloud and makes long text short.
          </p>
          <CheckList
            items={[
              'Makes long text short',
              'Reads aloud in English, Hindi and Marathi',
              'Makes flashcards and study notes',
            ]}
          />
          <button type="button" onClick={() => navigate('/learn')} className={primaryBtn}>
            <span>Try it now</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <JarvisChat />
      </div>
    </Chapter>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   04 · Accessibility & diagnostic calibration (assessment-section)
────────────────────────────────────────────────────────────────────────── */

export function AccessibilityChapter() {
  const navigate = useNavigate();
  const t = useTone();
  const [dyslexiaFont, setDyslexiaFont] = useState(true);
  const [wideLines, setWideLines] = useState(true);
  const demoFont = dyslexiaFont ? "'OpenDyslexic', 'Lexend', sans-serif" : 'sans-serif';

  const toggleClass = (on: boolean, onCls: string) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${focusRing} ${
      on ? onCls : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
    }`;

  return (
    <Chapter id="assessment-section" label="Accessibility First">
      <div className="space-y-4">
        <Eyebrow icon={<Eye size={15} />} tone="emerald">Read your way</Eyebrow>
        <h2 className="font-black tracking-tight" style={H2_STYLE}>
          Built around the way you read.
        </h2>
        <p className={`text-base leading-relaxed max-w-2xl ${t.body}`}>
          Change the font, spacing and colours until reading feels easy.
        </p>
      </div>

      {/* Live calibration demo */}
      <div className={`rounded-3xl border p-5 sm:p-6 space-y-4 ${t.inset}`}>
        <div className={`flex flex-wrap items-center justify-between gap-3 pb-3 border-b ${t.divider}`}>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-blue-400">
            Try it yourself
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              aria-pressed={dyslexiaFont}
              onClick={() => setDyslexiaFont((v) => !v)}
              className={toggleClass(dyslexiaFont, 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800')}
            >
              {dyslexiaFont ? '✓ OpenDyslexic On' : 'Standard Font'}
            </button>
            <button
              type="button"
              aria-pressed={wideLines}
              onClick={() => setWideLines((v) => !v)}
              className={toggleClass(wideLines, 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800')}
            >
              {wideLines ? '✓ 1.8x Spacing' : '1.2x Spacing'}
            </button>
          </div>
        </div>

        {/* Keeps its own font so the on/off comparison stays visible in Fun mode */}
        <div data-font-preview className={`p-5 rounded-2xl border ${t.card}`}>
          <h3
            className="font-bold"
            style={{ fontSize: '1.05rem', fontFamily: demoFont, letterSpacing: dyslexiaFont ? '0.04em' : 'normal' }}
          >
            Letters that stay still on the page.
          </h3>
          <p
            className={`text-sm mt-2 transition-all ${t.body}`}
            style={{ fontFamily: demoFont, lineHeight: wideLines ? 1.8 : 1.4, letterSpacing: dyslexiaFont ? '0.04em' : 'normal' }}
          >
            Heavier letters make b, d, p and q easier to tell apart. They stop flipping.
          </p>
        </div>

        <div className="grid grid-cols-1 @md:grid-cols-3 gap-2.5 text-xs font-medium">
          <div className={`p-3 rounded-xl border flex items-center gap-2 ${t.card} ${t.strong}`}>
            <Type size={16} className="text-[#2563EB] shrink-0" /> Heavier letters
          </div>
          <div className={`p-3 rounded-xl border flex items-center gap-2 ${t.card} ${t.strong}`}>
            <Volume2 size={16} className="text-emerald-600 shrink-0" /> Read aloud
          </div>
          <div className={`p-3 rounded-xl border flex items-center justify-center whitespace-nowrap font-mono font-bold tracking-[0.12em] text-[#2563EB] dark:text-blue-400 ${t.card}`}>
            b · d · p · q · m · w
          </div>
        </div>
      </div>

      <button type="button" onClick={() => navigate('/assessment')} className={secondaryBtn(t.isDarkMode)}>
        <span>Take the test</span>
        <ArrowRight size={16} className="text-[#2563EB]" />
      </button>
    </Chapter>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   05 · Chrome extension (extension-section)
────────────────────────────────────────────────────────────────────────── */

export function ExtensionChapter() {
  const navigate = useNavigate();
  const t = useTone();

  return (
    <Chapter id="extension-section" label="Google Chrome Extension">
      <div className="space-y-4">
        <Eyebrow icon={<Chrome size={15} />}>Chrome helper</Eyebrow>
        <h2 className="font-black tracking-tight" style={H2_STYLE}>
          Easy reading on every website.
        </h2>
        <p className={`text-base leading-relaxed max-w-2xl ${t.body}`}>
          After your test, get our free Chrome helper. It adds your font, ruler and voice to any website.
        </p>
      </div>

      {/* Browser-window mock */}
      <div className={`rounded-3xl border overflow-hidden ${t.card}`}>
        <div className={`flex items-center justify-between gap-3 px-5 py-3 border-b ${t.divider} ${t.isDarkMode ? 'bg-slate-950/60' : 'bg-slate-50/80'}`}>
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#2563EB] to-cyan-500 text-white flex items-center justify-center shrink-0">
              <Chrome size={15} />
            </div>
            <span className={`text-xs font-bold truncate ${t.title}`}>NeuroBridge Web Companion</span>
            <span className={`hidden @md:inline text-[11px] ${t.muted}`}>· Chrome Web Extension V3</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full shrink-0">
            ✓ Ready Post-Test
          </span>
        </div>
        <div className={`p-5 sm:p-6 space-y-3 text-sm leading-relaxed ${t.strong}`}>
          <div>
            Learning is not fixed. With the right tools, reading gets easier.
          </div>
          <div className="p-2.5 rounded-lg bg-amber-100/70 dark:bg-amber-950/50 border-y-2 border-amber-400 dark:border-amber-500 text-amber-950 dark:text-amber-200 font-medium">
            → The ruler shows the line you are reading
          </div>
          <div className={`text-xs ${t.muted}`}>
            Works on Wikipedia, news and school websites.
          </div>
          <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t ${t.divider} ${t.muted}`}>
            <span className="flex items-center gap-1.5">
              <Download size={13} /> Download after your test
            </span>
            <span className="text-[#2563EB] dark:text-blue-400 font-semibold">Free for students</span>
          </div>
        </div>
      </div>

      <CheckList
        items={[
          'Unlocks when you finish the test',
          'The ruler follows your mouse',
          'Reads any page out loud',
        ]}
      />

      <button type="button" onClick={() => navigate('/assessment')} className={primaryBtn}>
        <span>Take the test to get it</span>
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </Chapter>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   06 · How it works
────────────────────────────────────────────────────────────────────────── */

const STEPS = [
  {
    number: '01',
    title: 'Take the test',
    desc: 'A short, friendly test finds what helps you read.',
    icon: UserCheck,
    color: 'text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    tag: '5 minutes',
  },
  {
    number: '02',
    title: 'Play and learn',
    desc: 'Play brain games and take easy lessons.',
    icon: Gamepad2,
    color: 'text-[#7C3AED] dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    tag: 'Games and lessons',
  },
  {
    number: '03',
    title: 'Get the Chrome helper',
    desc: 'Use your reading settings on any website.',
    icon: Chrome,
    color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    tag: 'After the test',
  },
];

export function HowItWorksChapter() {
  const t = useTone();
  const { reduceMotion } = useDyslexia();

  return (
    <Chapter id="how-it-works-section" label="How NeuroBridge Works">
      <div className="space-y-4">
        <Eyebrow icon={<Check size={14} />}>3 easy steps</Eyebrow>
        <h2 className="font-black tracking-tight" style={H2_STYLE}>
          How it works.
        </h2>
        <p className={`text-base sm:text-lg leading-relaxed max-w-2xl ${t.body}`}>
          No hard setup. Just three simple steps.
        </p>
      </div>

      {/* Vertical timeline — reads top-to-bottom alongside the character */}
      <ol className="relative space-y-4">
        <span
          aria-hidden
          className="absolute left-[1.6rem] top-6 bottom-6 w-0.5 rounded-full bg-gradient-to-b from-[#2563EB] via-[#7C3AED] to-emerald-500 opacity-40"
        />
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.li
              key={s.number}
              initial={reduceMotion ? false : { opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="relative flex gap-4 sm:gap-5"
            >
              <div className={`relative z-10 w-[3.25rem] h-[3.25rem] shrink-0 rounded-2xl border flex items-center justify-center ${s.color} ${t.isDarkMode ? '' : 'shadow-2xs'}`}>
                <Icon size={22} />
              </div>
              <div className={`flex-1 rounded-2xl border p-5 sm:p-6 ${t.card}`}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                  <span className="text-sm font-black text-[#2563EB]/50 dark:text-blue-400/50">{s.number}</span>
                  <h3 className="font-bold" style={{ fontSize: '1.15rem' }}>{s.title}</h3>
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${t.chip}`}>{s.tag}</span>
                </div>
                <p className={`text-sm leading-relaxed ${t.body}`}>{s.desc}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </Chapter>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   07 · Community
────────────────────────────────────────────────────────────────────────── */

const COMMUNITY_CARDS = [
  {
    icon: MessageSquare,
    title: 'Fun ways to learn sounds',
    desc: 'Clapping and listening help me break words into parts.',
    author: 'Aarav M. · 12th Grade Student',
    tag: 'Sound tip',
    color: 'text-[#2563EB] bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900',
  },
  {
    icon: BookOpen,
    title: 'Reading without getting tired',
    desc: 'More space between lines and 15-minute breaks helped me in exams.',
    author: 'Priya K. · College Freshman',
    tag: 'Study tip',
    color: 'text-[#7C3AED] bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900',
  },
  {
    icon: Lightbulb,
    title: 'Studying with friends',
    desc: 'Our group uses voice chat and games to learn together.',
    author: 'Rohan D. · 11th Grade Student',
    tag: 'Friends and games',
    color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900',
  },
];

export function CommunityChapter() {
  const navigate = useNavigate();
  const t = useTone();

  return (
    <Chapter id="community-section" label="Community Support Preview">
      <div className="space-y-4">
        <Eyebrow icon={<Users size={14} />}>Community</Eyebrow>
        <h2 className="font-black tracking-tight" style={H2_STYLE}>
          You are not alone.
        </h2>
        <p className={`text-base sm:text-lg leading-relaxed max-w-2xl ${t.body}`}>
          Meet other learners. Share tips. Study together.
        </p>
      </div>

      <div className="space-y-3">
        {COMMUNITY_CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.title}
              type="button"
              onClick={() => navigate('/community')}
              className={`group w-full text-left rounded-2xl border p-5 flex gap-4 items-start transition-all cursor-pointer hover:-translate-y-0.5 ${focusRing} ${t.card} ${
                t.isDarkMode ? 'hover:border-slate-700' : 'hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className={`w-11 h-11 shrink-0 rounded-2xl border flex items-center justify-center ${c.color}`}>
                <Icon size={21} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className={`font-bold group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors ${t.title}`}>
                    {c.title}
                  </span>
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${t.chip}`}>{c.tag}</span>
                </div>
                <span className={`block text-sm leading-relaxed mt-1 ${t.body}`}>{c.desc}</span>
                <span className={`block text-[11px] mt-2 ${t.muted}`}>{c.author}</span>
              </div>
              <span className="text-[#2563EB] dark:text-blue-400 self-center group-hover:translate-x-1 transition-transform" aria-hidden>
                →
              </span>
            </button>
          );
        })}
      </div>

      <button type="button" onClick={() => navigate('/community')} className={primaryBtn}>
        <span>Join the community</span>
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </Chapter>
  );
}
