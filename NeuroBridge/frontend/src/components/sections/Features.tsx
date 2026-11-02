import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Briefcase,
  Sliders,
  Bot,
  ArrowRight,
  CheckCircle2,
  Volume2,
  Type,
  Eye,
  Layers,
  Chrome,
  Gamepad2,
  UserCheck,
  MessageCircle,
} from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';

const jarvisConversations = [
  {
    topic: "Reading Simplifier",
    user: "Can you summarize this dense chapter on neural plasticity into easy bullet points?",
    intro: "Here are the 3 key ideas broken down into simple words:",
    bullets: [
      "The brain builds stronger pathways whenever you practice a skill.",
      "Visual diagrams and audio narration make recall 2x faster.",
      "Short 15-minute practice sessions prevent reading exhaustion."
    ]
  },
  {
    topic: "Chrome Extension",
    user: "How do I download and use the Chrome extension after taking my assessment test?",
    intro: "Here is how your personalized Chrome extension works:",
    bullets: [
      "Immediately download the extension once you finish your 5-minute assessment test.",
      "Automatically applies your calibrated OpenDyslexic font and line ruler to any webpage.",
      "Listen to articles and study materials read aloud with natural text-to-speech."
    ]
  },
  {
    topic: "Study Sprint",
    user: "I get overwhelmed reading long text blocks. What strategy should I use?",
    intro: "Try this proven multisensory study approach:",
    bullets: [
      "Turn on the line-tracking ruler to focus on one sentence at a time.",
      "Listen to the paragraph read aloud once before reading along.",
      "Take a 2-minute visual rest between learning milestones."
    ]
  }
];

function JarvisChatShowcase({ isDarkMode }: { isDarkMode: boolean }) {
  const [activeTab, setActiveTab] = useState(0);
  const current = jarvisConversations[activeTab];

  return (
    <div className={`rounded-3xl border p-5 sm:p-7 space-y-4 transition-colors ${
      isDarkMode 
        ? 'bg-slate-900 border-slate-800 shadow-md text-white' 
        : 'bg-white border-slate-200/90 shadow-xs text-slate-900'
    }`}>
      {/* Header with Topic Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center justify-center font-bold shadow-2xs">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                JARVIS AI Study Guide
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              Multisensory Reading Companion
            </span>
          </div>
        </div>

        {/* Interactive Prompt Tabs */}
        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl">
          {jarvisConversations.map((item, idx) => (
            <button
              key={item.topic}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === idx
                  ? 'bg-white dark:bg-slate-700 text-[#2563EB] dark:text-blue-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.topic}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="space-y-4 min-h-[190px] flex flex-col justify-end text-xs sm:text-sm">
        {/* User Prompt */}
        <div className="ml-auto max-w-[90%] bg-[#2563EB] text-white p-3.5 rounded-2xl rounded-tr-xs font-normal shadow-2xs leading-relaxed">
          "{current.user}"
        </div>

        {/* AI Assistant Output with Deep Contrast & Normal Weight */}
        <div className={`mr-auto max-w-[94%] p-4 sm:p-5 rounded-2xl rounded-tl-xs space-y-2.5 border ${
          isDarkMode 
            ? 'bg-slate-800/80 border-slate-700 text-white' 
            : 'bg-slate-50 border-slate-200 text-slate-900 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold text-purple-700 dark:text-purple-300">
            <span>{current.intro}</span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#2563EB] dark:text-blue-400 cursor-pointer">
              <Volume2 size={13} />
              <span>Listen</span>
            </div>
          </div>
          
          <div className="space-y-1.5 text-xs sm:text-sm pl-3 border-l-2 border-[#2563EB]">
            {current.bullets.map((bullet, i) => (
              <p key={i} className="leading-relaxed font-normal text-slate-700 dark:text-slate-300">
                • {bullet}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Features() {
  const navigate = useNavigate();
  const { isDarkMode, reduceMotion, isDyslexiaMode } = useDyslexia();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll parallax for sections
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const springConfig = { damping: 25, stiffness: 90 };

  // Staggered parallax for the 4 pillars cards
  const rawPillarY1 = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const pillarY1 = useSpring(rawPillarY1, springConfig);

  const rawPillarY2 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const pillarY2 = useSpring(rawPillarY2, springConfig);

  // Parallax for Jarvis split layout
  const rawJarvisLeftY = useTransform(scrollYProgress, [0.2, 0.7], [35, -35]);
  const jarvisLeftY = useSpring(rawJarvisLeftY, springConfig);

  const rawJarvisRightY = useTransform(scrollYProgress, [0.2, 0.7], [-35, 35]);
  const jarvisRightY = useSpring(rawJarvisRightY, springConfig);

  // Parallax for Sensory split layout
  const rawSensoryLeftY = useTransform(scrollYProgress, [0.4, 0.9], [30, -30]);
  const sensoryLeftY = useSpring(rawSensoryLeftY, springConfig);

  const rawSensoryRightY = useTransform(scrollYProgress, [0.4, 0.9], [-25, 25]);
  const sensoryRightY = useSpring(rawSensoryRightY, springConfig);

  // Interactive Sensory Calibration Demo State
  const [demoDyslexiaFont, setDemoDyslexiaFont] = useState(true);
  const [demoLineHeight, setDemoLineHeight] = useState(true);

  const corePillars = [
    {
      title: 'Play',
      subtitle: 'Cognitive Brain Games',
      desc: 'Play memory games, sound lab challenges, and phonics sprints that strengthen reading confidence and cognitive speed.',
      icon: Gamepad2,
      color: 'text-[#2563EB]',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      border: 'border-blue-200/80 dark:border-blue-900/60',
      badge: 'Brain Games',
      parallaxY: pillarY1,
    },
    {
      title: 'Learn',
      subtitle: 'Dyslexia Courses',
      desc: 'Visual, self-paced courses with bite-sized lessons, multisensory audio guides, and zero cognitive overload.',
      icon: BookOpen,
      color: 'text-[#7C3AED]',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      border: 'border-purple-200/80 dark:border-purple-900/60',
      badge: 'Sensory Courses',
      parallaxY: pillarY2,
    },
    {
      title: 'Assess',
      subtitle: 'Diagnostic Assessment',
      desc: 'Take an engaging 5-minute assessment test to identify your reading patterns and calibrate your personal sensory profile.',
      icon: UserCheck,
      color: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      border: 'border-emerald-200/80 dark:border-emerald-900/60',
      badge: 'Sensory Test',
      parallaxY: pillarY1,
    },
    {
      title: 'Extend',
      subtitle: 'Chrome Extension',
      desc: 'Download immediately after completing your test to apply your customized font, tracking ruler, and speech to any website.',
      icon: Chrome,
      color: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      border: 'border-amber-200/80 dark:border-amber-900/60',
      badge: 'Post-Test Download',
      parallaxY: pillarY2,
    },
  ];

  return (
    <div ref={sectionRef} className="space-y-16 sm:space-y-24 w-full">
      {/* ─── SECTION 1: WHAT IS NEUROBRIDGE? (COGNITIVE GAMES & PILLARS) ── */}
      <section id="games-section" className="space-y-10" aria-label="Core Capabilities">
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
            <Layers size={14} />
            <span>Platform Capabilities</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            One platform for your complete learning journey.
          </h2>
          <p className={`text-base sm:text-lg font-normal leading-relaxed ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            From interactive brain games to downloading our Chrome extension after your test, every tool inside
            NeuroBridge adapts to how your mind processes information best.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch">
          {corePillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                style={reduceMotion || isDyslexiaMode ? {} : { y: pillar.parallaxY }}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={reduceMotion ? {} : { y: -6, transition: { duration: 0.2 } }}
                className={`rounded-2xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-white shadow-xs hover:border-slate-700'
                    : 'bg-white border-slate-200 shadow-xs hover:border-slate-300 text-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl ${pillar.bg} ${pillar.color} ${pillar.border} border flex items-center justify-center shadow-2xs`}
                    >
                      <Icon size={24} />
                    </div>
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                      isDarkMode 
                        ? 'bg-slate-800 text-slate-300 border-slate-700' 
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {pillar.title}
                  </h3>
                  <div className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 mb-2.5">
                    {pillar.subtitle}
                  </div>
                  <p className={`text-xs sm:text-[13px] font-normal leading-relaxed ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {pillar.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── SECTION 2: JARVIS AI & DYSLEXIA COURSES (PARALLAX SPLIT) ──── */}
      <section id="courses-section" className={`rounded-3xl border p-6 sm:p-10 lg:p-12 transition-colors ${
        isDarkMode 
          ? 'bg-slate-900/90 border-slate-800' 
          : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Description (6 Cols) */}
          <motion.div 
            style={reduceMotion || isDyslexiaMode ? {} : { y: jarvisLeftY }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold">
              <Bot size={15} />
              <span>Intelligent Study Companion</span>
            </div>

            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Meet JARVIS, your personal AI learning assistant.
            </h2>

            <p className={`text-base font-normal leading-relaxed ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Get instant support simplifying dense readings, turning long text blocks into clear
              visual bullets, and explaining difficult concepts through speech or text.
            </p>

            {/* Accessible Feature Bullets with Normal Weight */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>
                  One-tap paragraph simplification and summary cards
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>
                  Multisensory text-to-speech voice narration in English, Hindi & Marathi
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>
                  Contextual study guides, flashcards, and course sprint summaries
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/learn')}
              className="px-7 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Learning Arena</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* Right Simulated JARVIS Interactive Chat (6 Cols with Parallax Offset) */}
          <motion.div 
            style={reduceMotion || isDyslexiaMode ? {} : { y: jarvisRightY }}
            className="lg:col-span-6"
          >
            <JarvisChatShowcase isDarkMode={isDarkMode} />
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 3: LIVE SENSORY & DIAGNOSTIC CALIBRATION (PARALLAX SPLIT) ── */}
      <section id="assessment-section" className={`rounded-3xl border p-6 sm:p-10 lg:p-12 transition-colors ${
        isDarkMode 
          ? 'bg-slate-900/90 border-slate-800' 
          : 'bg-white border-slate-200/90 shadow-xs'
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Interactive Accessibility Simulator (6 Cols) */}
          <motion.div 
            style={reduceMotion || isDyslexiaMode ? {} : { y: sensoryLeftY }}
            className={`lg:col-span-6 order-2 lg:order-1 rounded-3xl border p-5 sm:p-7 space-y-4 ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200/90'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-blue-400">
                Live Sensory Calibration
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDemoDyslexiaFont(!demoDyslexiaFont)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    demoDyslexiaFont
                      ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'
                  }`}
                >
                  {demoDyslexiaFont ? '✓ OpenDyslexic On' : 'Standard Font'}
                </button>
                <button
                  type="button"
                  onClick={() => setDemoLineHeight(!demoLineHeight)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    demoLineHeight
                      ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'
                  }`}
                >
                  {demoLineHeight ? '✓ 1.8x Spacing' : '1.2x Spacing'}
                </button>
              </div>
            </div>

            {/* Live Text Sample Display */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <h4 
                className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                style={{ 
                  fontFamily: demoDyslexiaFont ? "'OpenDyslexic', 'Lexend', sans-serif" : "sans-serif",
                  letterSpacing: demoDyslexiaFont ? '0.04em' : 'normal'
                }}
              >
                Letters that stay anchored on the page.
              </h4>
              <p
                className={`text-xs sm:text-sm font-normal mt-2 transition-all leading-relaxed ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
                style={{
                  fontFamily: demoDyslexiaFont ? "'OpenDyslexic', 'Lexend', sans-serif" : "sans-serif",
                  lineHeight: demoLineHeight ? '1.8' : '1.4',
                  letterSpacing: demoDyslexiaFont ? '0.04em' : 'normal',
                }}
              >
                Heavy-bottom letterforms give gravity to characters like <strong>b</strong>, <strong>d</strong>, <strong>p</strong>, and <strong>q</strong>. 
                This stops visual crowding and flipping, allowing you to read with confidence and ease.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs font-medium">
              <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <Type size={16} className="text-[#2563EB]" />
                <span>Weighted Baselines</span>
              </div>
              <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <Volume2 size={16} className="text-emerald-600" />
                <span>Text-to-Speech Engine</span>
              </div>
            </div>
          </motion.div>

          {/* Right Description (6 Cols) */}
          <motion.div 
            style={reduceMotion || isDyslexiaMode ? {} : { y: sensoryRightY }}
            className="lg:col-span-6 order-1 lg:order-2 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
              <Eye size={15} />
              <span>Accessibility First</span>
            </div>

            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Built around the way you learn and perceive.
            </h2>

            <p className={`text-base font-normal leading-relaxed ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              NeuroBridge replaces rigid clinical tools with a warm, empowering workspace. 
              Personalize font weight, letter spacing, line height, and color contrast to eliminate reading strain.
            </p>

            <button
              type="button"
              onClick={() => navigate('/assessment')}
              className={`px-7 py-3.5 rounded-2xl font-bold text-sm transition-all border shadow-xs inline-flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <span>Take Diagnostic Assessment</span>
              <ArrowRight size={16} className="text-[#2563EB]" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 4: GOOGLE CHROME EXTENSION SHOWCASE (POST-TEST) ─── */}
      <section id="extension-section" className={`rounded-3xl border p-6 sm:p-10 lg:p-12 transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Description (6 Cols) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
              <Chrome size={15} />
              <span>Google Chrome Extension</span>
            </div>

            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight leading-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Take your reading superpowers everywhere on the web.
            </h2>

            <p className={`text-base font-normal leading-relaxed ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Download our official Chrome extension immediately after taking your 5-minute assessment test.
              The extension injects your calibrated OpenDyslexic font, line-tracking ruler, and voice narration directly into Wikipedia, news articles, PDFs, and classroom study portals.
            </p>

            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>
                  1-Click download unlocked automatically upon test completion
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>
                  Follows your mouse with a smooth line-tracking ruler
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>
                  Converts any web paragraph into natural audio narration
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/assessment')}
              className="px-8 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-all shadow-md shadow-blue-500/25 inline-flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Take Test to Unlock Extension</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Right Extension Preview Mockup */}
          <div className="lg:col-span-6">
            <div className={`rounded-3xl border p-6 sm:p-7 space-y-4 shadow-sm text-left ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563EB] to-cyan-500 text-white flex items-center justify-center shadow-xs">
                    <Chrome size={22} />
                  </div>
                  <div>
                    <span className={`text-sm font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      NeuroBridge Web Companion
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Chrome Web Extension V3
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                  ✓ Ready Post-Test
                </span>
              </div>

              {/* Mock Web Page with Reading Ruler Highlight */}
              <div className={`p-4 rounded-2xl border space-y-2.5 relative overflow-hidden font-normal text-xs sm:text-sm leading-relaxed ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <p>
                  "Neuroplasticity reveals that learning is not fixed. When dyslexic readers use multisensory line-tracking guides and audio narration, visual comprehension increases by over 40%."
                </p>
                {/* Active Simulated Line Ruler */}
                <div className="p-2 rounded-lg bg-amber-100/70 dark:bg-amber-950/50 border-y-2 border-amber-400 dark:border-amber-500 text-amber-950 dark:text-amber-200 font-medium">
                  → Active sentence tracked by your NeuroBridge Chrome ruler
                </div>
                <p className="text-slate-400 dark:text-slate-500 text-xs">
                  "Short sprints and line rulers eliminate visual crowding across Wikipedia and study websites."
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>Instant 1-click download post-assessment</span>
                <span className="text-[#2563EB] dark:text-blue-400 font-semibold">100% Free for Students</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
