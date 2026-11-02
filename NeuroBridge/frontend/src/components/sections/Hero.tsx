import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import {
  Sparkles,
  ArrowRight,
  Sliders,
  FileText,
  TrendingUp,
  Compass,
  Volume2,
  Bot,
  Chrome,
  Gamepad2,
  Download,
} from 'lucide-react';

export function Hero() {
  const navigate = useNavigate();
  const { isDarkMode, reduceMotion, isDyslexiaMode, toggleDyslexiaMode } = useDyslexia();
  const heroRef = useRef<HTMLDivElement>(null);

  // Rotating headline phrases
  const phrases = [
    "for your goals.",
    "for your brain.",
    "for your future.",
    "for every learner.",
    "for you."
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3200);
    return () => clearInterval(intervalId);
  }, [phrases.length]);

  // ─── 1. SCROLL-DRIVEN PARALLAX ──────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const springConfig = { damping: 24, stiffness: 90 };

  const rawHeroTextY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const heroTextY = useSpring(rawHeroTextY, springConfig);

  const rawHeroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.2]);
  const heroOpacity = useSpring(rawHeroOpacity, springConfig);

  const rawStageY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const stageY = useSpring(rawStageY, springConfig);

  const rawStageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.015, 0.98]);
  const stageScale = useSpring(rawStageScale, springConfig);

  // Staggered parallax for cards inside the workspace stage
  const rawCard1Y = useTransform(scrollYProgress, [0, 1], [0, -45]);
  const card1Y = useSpring(rawCard1Y, springConfig);

  const rawCard2Y = useTransform(scrollYProgress, [0, 1], [0, -95]);
  const card2Y = useSpring(rawCard2Y, springConfig);

  const rawCard3Y = useTransform(scrollYProgress, [0, 1], [0, -55]);
  const card3Y = useSpring(rawCard3Y, springConfig);

  // Background ambient floating orbs parallax
  const rawOrb1Y = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const orb1Y = useSpring(rawOrb1Y, springConfig);

  const rawOrb2Y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const orb2Y = useSpring(rawOrb2Y, springConfig);

  const rawTrustY = useTransform(scrollYProgress, [0, 1], [0, -35]);
  const trustY = useSpring(rawTrustY, springConfig);

  // ─── 2. GENTLE MOUSE PARALLAX & 3D TILT ─────────────────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, { damping: 30, stiffness: 120 });
  const smoothMouseY = useSpring(mouseY, { damping: 30, stiffness: 120 });

  const stageRotateX = useTransform(smoothMouseY, [-0.5, 0.5], [3, -3]);
  const stageRotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-4, 4]);

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || isDyslexiaMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };

  const handleStageMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const soundwaveHeights = [18, 32, 22, 40, 26, 36, 20];

  return (
    <section 
      ref={heroRef}
      className={`relative overflow-hidden pt-4 sm:pt-8 pb-16 sm:pb-24 transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-[#0B1120] text-[#F8FAFC]' 
          : 'bg-white text-slate-900'
      }`}
      style={{
        width: '100vw',
        left: '50%',
        marginLeft: '-50vw',
        right: '50%',
        marginRight: '-50vw',
      }}
      aria-label="Hero Section"
    >
      {/* ─── 0. PARALLAX AMBIENT GLOW ORBS ─────────────────────────────── */}
      <motion.div 
        style={reduceMotion || isDyslexiaMode ? {} : { y: orb1Y }}
        className={`pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[720px] h-[440px] rounded-full blur-[140px] transition-opacity duration-700 -z-10 ${
          isDarkMode ? 'bg-indigo-600/15' : 'bg-blue-100/40'
        }`} 
      />

      <motion.div 
        style={reduceMotion || isDyslexiaMode ? {} : { y: orb2Y }}
        className={`pointer-events-none absolute top-1/3 -left-36 w-[520px] h-[520px] rounded-full blur-[150px] transition-opacity duration-700 -z-10 ${
          isDarkMode ? 'bg-purple-600/12' : 'bg-indigo-100/30'
        }`} 
      />

      <motion.div 
        style={reduceMotion || isDyslexiaMode ? {} : { y: orb1Y }}
        className={`pointer-events-none absolute top-1/3 -right-36 w-[520px] h-[520px] rounded-full blur-[150px] transition-opacity duration-700 -z-10 ${
          isDarkMode ? 'bg-blue-600/12' : 'bg-purple-100/25'
        }`} 
      />

      {/* Subtle Neural Constellation Background */}
      {!isDyslexiaMode && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10 opacity-30 dark:opacity-20">
          <svg className="w-full h-full stroke-blue-500/25 dark:stroke-indigo-400/25" xmlns="http://www.w3.org/2000/svg">
            <line x1="8%" y1="18%" x2="18%" y2="24%" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="18%" y1="24%" x2="14%" y2="42%" strokeWidth="1" />
            <line x1="14%" y1="42%" x2="24%" y2="52%" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="8%" cy="18%" r="2.5" fill="#3B82F6" />
            <circle cx="18%" cy="24%" r="3" fill="#2563EB" />
            <circle cx="14%" cy="42%" r="2.5" fill="#7C3AED" />
            <circle cx="24%" cy="52%" r="2" fill="#3B82F6" />

            <line x1="92%" y1="18%" x2="82%" y2="24%" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="82%" y1="24%" x2="86%" y2="42%" strokeWidth="1" />
            <line x1="86%" y1="42%" x2="76%" y2="52%" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="92%" cy="18%" r="2.5" fill="#3B82F6" />
            <circle cx="82%" cy="24%" r="3" fill="#2563EB" />
            <circle cx="86%" cy="42%" r="2.5" fill="#7C3AED" />
            <circle cx="76%" cy="52%" r="2" fill="#3B82F6" />
          </svg>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        {/* ─── 1. HERO COPY (PARALLAX SHIFT ON SCROLL) ────────────────── */}
        <motion.div 
          style={reduceMotion || isDyslexiaMode ? {} : { y: heroTextY, opacity: heroOpacity }}
          className="max-w-3xl mx-auto text-center space-y-5"
        >
          {/* Eyebrow Pill */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isDarkMode
                ? 'bg-slate-800 text-amber-300 border border-slate-700'
                : 'bg-blue-50 text-[#2563EB] border border-blue-200/90 shadow-2xs'
            }`}
          >
            <Sparkles size={14} className={isDarkMode ? 'text-amber-400' : 'text-blue-600'} />
            <span>Empowering Neurodivergent Learners · Dyslexia-Friendly</span>
          </motion.div>

          {/* Primary Dynamic Heading */}
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.16] ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            Learning should work <br className="hidden sm:inline" />
            <span className="grid relative mt-1.5">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentPhraseIndex}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="col-start-1 row-start-1 bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#9333EA] bg-clip-text text-transparent pb-1 font-black"
                >
                  {phrases[currentPhraseIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          {/* Subtitle with Comfortable Regular Weight */}
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-base sm:text-lg font-normal leading-relaxed max-w-2xl mx-auto ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Play cognitive brain games, learn with sensory courses, chat with friends, take diagnostic
            assessments, and download our personalized Chrome extension to read any website with confidence.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-1"
          >
            <button
              type="button"
              data-jarvis-id="hero-get-started"
              onClick={() => navigate('/assessment')}
              className="px-8 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center gap-2.5 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Take Assessment Test</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <button
              type="button"
              data-jarvis-id="hero-explore-features"
              onClick={() => navigate('/learn')}
              className={`px-7 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-2xs flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white'
                  : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-900'
              }`}
            >
              <span>Play Games & Courses</span>
              <Gamepad2 size={16} className="text-[#2563EB]" />
            </button>
          </motion.div>
        </motion.div>

        {/* ─── 2. INTERACTIVE PARALLAX WORKSPACE STAGE ────────────────── */}
        <motion.div 
          style={reduceMotion || isDyslexiaMode ? {} : { 
            y: stageY,
            scale: stageScale,
            rotateX: stageRotateX,
            rotateY: stageRotateY,
            transformPerspective: 1200,
          }}
          onMouseMove={handleStageMouseMove}
          onMouseLeave={handleStageMouseLeave}
          className={`relative max-w-6xl mx-auto rounded-3xl sm:rounded-[36px] border transition-all duration-300 overflow-hidden ${
            isDarkMode 
              ? 'bg-slate-900/90 border-slate-800 shadow-[0_24px_70px_-15px_rgba(0,0,0,0.8)]' 
              : 'bg-white border-slate-200/90 shadow-[0_24px_70px_-15px_rgba(37,99,235,0.08),0_2px_8px_rgba(15,23,42,0.04)]'
          }`}
        >
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-slate-200/80 dark:border-slate-800 select-none bg-slate-50/70 dark:bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="w-3 h-3 rounded-full bg-[#10B981]" />
              </div>
              <span className={`text-xs font-semibold tracking-wide ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                NeuroBridge Learning Workspace
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Session
              </span>
            </div>

            {/* Direct Interactive Dyslexia Mode Switch */}
            <button
              type="button"
              onClick={toggleDyslexiaMode}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                isDyslexiaMode
                  ? 'bg-blue-50 text-[#2563EB] border-blue-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 shadow-2xs'
                  : isDarkMode
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-2xs'
              }`}
              title="Click to toggle sensory & dyslexia accommodations"
            >
              <span className={`w-2 h-2 rounded-full ${isDyslexiaMode ? 'bg-[#2563EB] dark:bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{isDyslexiaMode ? '✨ Dyslexia Mode Active' : 'Dyslexia Mode: OFF'}</span>
            </button>
          </div>

          {/* ── 3 MULTI-LAYERED PARALLAX WORKSPACE PANELS ─────────────── */}
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-6 items-stretch">
              
              {/* ── PANEL 1: SENSORY COMFORT ENGINE ── */}
              <motion.div
                style={reduceMotion || isDyslexiaMode ? {} : { y: card1Y }}
                whileHover={reduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
                className={`rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 shadow-sm text-white'
                    : 'bg-white border-slate-200/90 shadow-xs text-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-blue-400 flex items-center gap-1.5">
                      <Sliders size={15} /> Accessibility
                    </span>
                    <span className="text-[11px] font-medium text-[#2563EB] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full">
                      Calibrated
                    </span>
                  </div>

                  <h3 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Sensory Comfort Engine
                  </h3>
                  <p className={`text-xs sm:text-sm font-normal mt-1 leading-relaxed ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    OpenDyslexic typography + comfortable 1.8x line-height.
                  </p>

                  {/* Heavy-bottom letterform preview */}
                  <div className={`mt-4 p-3.5 rounded-xl border ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Weighted Baseline Anchors
                    </div>
                    <div className="text-xl font-bold tracking-widest text-[#2563EB] dark:text-blue-400 font-mono">
                      b · d · p · q · m · w
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Gravity-weighted bottoms eliminate letter flipping
                    </div>
                  </div>
                </div>

                {/* Key Settings Stack */}
                <div className="mt-5 space-y-2 text-xs">
                  <div className={`flex justify-between items-center px-3.5 py-2.5 rounded-xl border ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Dyslexia Font
                    </span>
                    <span className="font-semibold text-[#2563EB] dark:text-blue-400">OpenDyslexic</span>
                  </div>
                  <div className={`flex justify-between items-center px-3.5 py-2.5 rounded-xl border ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Text Scaling
                    </span>
                    <span className="font-semibold text-[#2563EB] dark:text-blue-400">110%</span>
                  </div>
                </div>
              </motion.div>

              {/* ── PANEL 2: ADAPTIVE LEARNING ARENA ── */}
              <motion.div
                style={reduceMotion || isDyslexiaMode ? {} : { y: card2Y }}
                whileHover={reduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
                className={`rounded-2xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                  isDarkMode
                    ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700/80 shadow-md text-white'
                    : 'bg-gradient-to-b from-white to-blue-50/40 border-blue-200 shadow-md text-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-blue-400 flex items-center gap-1.5">
                      <TrendingUp size={15} /> Learning Arena
                    </span>
                    <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span>🔥</span>
                      <span>7-Day Streak</span>
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <div className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      84% Accuracy
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      +14% this week
                    </span>
                  </div>

                  <p className={`text-xs sm:text-sm font-normal mt-1.5 leading-relaxed ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    Sound Lab & Memory Vault milestones reached
                  </p>

                  {/* Interactive Phonics Audio Visualizer Bars */}
                  <div className={`mt-5 p-4 rounded-xl border ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-blue-100 shadow-2xs'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-[#2563EB] dark:text-blue-400 flex items-center gap-1.5">
                        <Volume2 size={13} /> Phonics Audio Sprint
                      </span>
                      <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                        Lesson 4 · Active
                      </span>
                    </div>

                    <div className="flex items-end justify-between h-10 px-2 pt-2">
                      {soundwaveHeights.map((h, i) => (
                        <motion.div
                          key={i}
                          animate={reduceMotion ? false : {
                            height: [h * 0.6, h, h * 0.7],
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            delay: i * 0.14,
                            ease: 'easeInOut',
                          }}
                          className="w-2 rounded-full bg-gradient-to-t from-[#2563EB] to-[#7C3AED]"
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Focus Score */}
                <div className="mt-5 space-y-2">
                  <div className={`h-2.5 w-full rounded-full overflow-hidden p-0.5 border ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <div className="h-full bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-emerald-500 rounded-full w-4/5" />
                  </div>
                  <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <span>Focus Score: 780</span>
                    <span className="text-[#2563EB] dark:text-blue-400 font-semibold">Milestone: Master</span>
                  </div>
                </div>
              </motion.div>

              {/* ── PANEL 3: GOOGLE CHROME EXTENSION (DOWNLOAD AFTER TEST) ── */}
              <motion.div
                style={reduceMotion || isDyslexiaMode ? {} : { y: card3Y }}
                whileHover={reduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
                className={`rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 shadow-sm text-white'
                    : 'bg-white border-slate-200/90 shadow-xs text-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-blue-400 flex items-center gap-1.5">
                      <Chrome size={15} /> Chrome Extension
                    </span>
                    <span className="text-[11px] font-medium text-[#2563EB] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full">
                      Post-Test Download
                    </span>
                  </div>

                  <h3 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Personalized Web Reader
                  </h3>
                  <p className={`text-xs sm:text-sm font-normal mt-1 leading-relaxed ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    Download after giving your test to apply your calibrated font, ruler, and audio to any website.
                  </p>

                  {/* Chrome Extension Feature Box */}
                  <div className={`mt-4 p-3.5 rounded-xl border flex items-center justify-between ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <span className={`text-xs font-semibold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        NeuroBridge Browser Companion
                      </span>
                      <span className={`text-[11px] font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        OpenDyslexic • Line Ruler • High Contrast
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <Download size={11} /> Unlocks After Test
                    </span>
                  </div>
                </div>

                {/* JARVIS AI Voice Companion Dock */}
                <div className={`mt-5 p-3.5 rounded-xl border flex items-center gap-3 ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-blue-50/70 border-blue-200/80'
                }`}>
                  <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Bot size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2563EB] dark:text-blue-400">
                        JARVIS AI Companion
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className={`text-xs font-medium mt-0.5 truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      "Ready to read any section aloud!"
                    </p>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>

        {/* ─── 3. PARALLAX FLOATING TRUST & IMPACT STRIP ─────────────── */}
        <motion.div 
          style={reduceMotion || isDyslexiaMode ? {} : { y: trustY }}
          className="max-w-4xl mx-auto pt-4"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-2xs'
            }`}>
              <div className="text-xl sm:text-2xl font-black text-[#2563EB] dark:text-blue-400">
                12,000+
              </div>
              <div className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                Students Empowered
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-2xs'
            }`}>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                100%
              </div>
              <div className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                Dyslexia Calibrated
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-2xs'
            }`}>
              <div className="text-xl sm:text-2xl font-black text-[#7C3AED] dark:text-purple-400">
                94%
              </div>
              <div className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                Confidence Boost
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-2xs'
            }`}>
              <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                Chrome Ready
              </div>
              <div className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                Post-Test Extension
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
