import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { Hero } from '../sections/Hero';
import { Features } from '../sections/Features';
import { HowItWorks } from '../sections/HowItWorks';
import { GreatCompany } from '../sections/GreatCompany';
import { CommunitySectionPreview } from '../sections/CommunitySectionPreview';
import { ScrollStudentGuide } from '../ui/ScrollStudentGuide';
import { SplitFigureStage } from '../ui/SplitFigureStage';

export default function Index() {
  const navigate = useNavigate();
  const { isDarkMode, reduceMotion, isDyslexiaMode } = useDyslexia();
  const pageRef = useRef<HTMLDivElement>(null);
  
  // Page-wide scroll progress for top progress indicator and ambient parallax
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { damping: 25, stiffness: 100 });

  const rawBgOrb1Y = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const bgOrb1Y = useSpring(rawBgOrb1Y, { damping: 30, stiffness: 80 });

  const rawBgOrb2Y = useTransform(scrollYProgress, [0, 1], [0, -350]);
  const bgOrb2Y = useSpring(rawBgOrb2Y, { damping: 30, stiffness: 80 });

  // Mouse spotlight for final CTA card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    if (reduceMotion || isDyslexiaMode) return;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div ref={pageRef} className={`w-full min-h-screen transition-colors duration-500 relative ${
      isDarkMode ? 'bg-[#0B1120]' : 'bg-white'
    }`}>
      {/* ─── 0. TOP SCROLL PROGRESS BAR (ANIMATES ON SCROLL DOWN AND UP) ── */}
      {!reduceMotion && !isDyslexiaMode && (
        <motion.div
          style={{ scaleX: smoothProgress, transformOrigin: '0%' }}
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-emerald-400 z-50 pointer-events-none"
        />
      )}

      {/* ─── MOBILE ONLY COMPACT COMPANION (< 1024px) ────────────────── */}
      <div className="lg:hidden">
        <ScrollStudentGuide />
      </div>

      {/* ─── AMBIENT PARALLAX BACKGROUND DRIFT ORBS ──────────────────── */}
      {!isDyslexiaMode && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10 select-none">
          <motion.div
            style={reduceMotion ? {} : { y: bgOrb1Y }}
            className={`absolute top-[900px] -left-40 w-[600px] h-[600px] rounded-full blur-[170px] ${
              isDarkMode ? 'bg-indigo-600/10' : 'bg-blue-100/35'
            }`}
          />
          <motion.div
            style={reduceMotion ? {} : { y: bgOrb2Y }}
            className={`absolute top-[1800px] -right-40 w-[650px] h-[650px] rounded-full blur-[180px] ${
              isDarkMode ? 'bg-purple-600/10' : 'bg-purple-100/30'
            }`}
          />
          <motion.div
            style={reduceMotion ? {} : { y: bgOrb1Y }}
            className={`absolute top-[2800px] left-1/4 w-[550px] h-[550px] rounded-full blur-[180px] ${
              isDarkMode ? 'bg-blue-600/10' : 'bg-indigo-100/25'
            }`}
          />
        </div>
      )}

      {/* ─── SPLIT-SCREEN ARCHITECTURE: 52% CONTENT / 48% 3D FIGURE STAGE ── */}
      <div className="w-full flex flex-col lg:flex-row items-stretch relative">
        {/* ── LEFT: SCROLLABLE DYSLEXIC CONTENT (52% - 53%) ── */}
        <main className="w-full lg:w-[53%] xl:w-[52%] 2xl:w-[52%] space-y-16 sm:space-y-24 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 xl:px-12 z-10 pb-16">
          {/* 1. Hero Section */}
          <div id="hero-section">
            <Hero />
          </div>

          {/* 2. Core Features (Play Games, Courses, Diagnostic Test, Chrome Extension) */}
          <div id="features-section">
            <Features />
          </div>

          {/* 3. How It Works (3-Step Progression with Parallax Rail) */}
          <div id="how-it-works-section">
            <HowItWorks />
          </div>

          {/* 4. Community Section Preview (Inclusive Peer Circles & Friend Chat) */}
          <div id="community-section">
            <CommunitySectionPreview />
          </div>
        </main>

        {/* ── RIGHT: STICKY 3D STUDENT FIGURE STAGE (47% - 48%) ── */}
        <aside className="hidden lg:block lg:w-[47%] xl:w-[48%] 2xl:w-[48%] relative">
          <div className="sticky top-18 h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 xl:p-8 select-none">
            <SplitFigureStage scrollYProgress={scrollYProgress} />
          </div>
        </aside>
      </div>

      {/* ─── NATURAL TRANSITION: REMAINING WEBSITE SECTIONS (FULL WIDTH) ─── */}
      <div className="w-full space-y-16 sm:space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* 5. You're in Great Company (Inspirational Dyslexic Pioneers) */}
        <div id="great-company-section">
          <GreatCompany />
        </div>

        {/* 6. Final Call to Action Card (High Contrast & Dyslexia-Calibrated) */}
        <div id="cta-section">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onMouseMove={handleMouseMove}
            className={`group rounded-3xl sm:rounded-[36px] border p-8 sm:p-12 lg:p-14 text-center space-y-6 relative overflow-hidden transition-all ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] border-slate-800 shadow-xl'
                : 'bg-gradient-to-br from-[#1E3A8A] via-[#1E293B] to-[#0F172A] border-blue-900 shadow-xl'
            }`}
          >
            {/* Subtle Spotlight Effect */}
            {!reduceMotion && !isDyslexiaMode && (
              <motion.div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
                style={{
                  background: useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.06), transparent 40%)`,
                }}
              />
            )}

            {/* Calm Ambient Orbs */}
            {!reduceMotion && !isDyslexiaMode && (
              <>
                <div className="absolute -top-24 -left-20 w-72 h-72 bg-blue-600/15 blur-[90px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-32 -right-24 w-96 h-96 bg-purple-600/15 blur-[100px] rounded-full pointer-events-none" />
              </>
            )}

            <div className="relative z-10 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-900/40 text-blue-200 border border-blue-500/30 text-xs font-bold">
              <Sparkles size={14} className="text-blue-300" />
              <span>Empowering Every Mind</span>
            </div>

            <h2 className="relative z-10 text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl mx-auto">
              Your way of learning starts right here.
            </h2>

            <p className="relative z-10 text-sm sm:text-base text-blue-100 font-medium leading-relaxed max-w-xl mx-auto">
              Take the 5-minute diagnostic assessment test, download our personalized Chrome extension,
              play cognitive brain games, and learn with visual courses designed for your brain.
            </p>

            <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate('/assessment')}
                className="px-8 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-sm shadow-md shadow-blue-500/25 border border-blue-400/20 transition-all flex items-center gap-2 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Take Assessment Test</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

              <button
                type="button"
                onClick={() => navigate('/learn')}
                className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-sm transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                Play Games & Courses
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
