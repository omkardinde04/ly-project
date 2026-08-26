import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  Bot,
  Sliders,
  FileText,
  TrendingUp,
  CheckCircle2,
  Users,
  Compass,
  Play,
  Briefcase,
} from 'lucide-react';

export function Hero() {
  const navigate = useNavigate();
  const { language, reduceMotion } = useDyslexia();
  const t = getTranslation(language);

  return (
    <section className="relative overflow-hidden pt-4 pb-12 sm:pb-16" aria-label="Hero Section">
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-100/40 via-indigo-50/30 to-purple-100/20 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ─── 1. TOP HERO COPY & CTAS ──────────────────────────────── */}
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Eyebrow Pill */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 text-[#2563EB] border border-blue-200/80 text-xs font-extrabold shadow-2xs"
          >
            <Sparkles size={13} className="text-[#8B5CF6]" />
            <span>Empowering Neurodivergent Learners · Dyslexia-Friendly</span>
          </motion.div>

          {/* Primary Heading */}
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1A202C] tracking-tight leading-[1.12]"
          >
            Learning should work <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] bg-clip-text text-transparent">
              for your brain.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-lg text-[#64748B] font-medium leading-relaxed max-w-2xl mx-auto"
          >
            NeuroBridge is an accessible learning and career platform designed to help students
            learn, grow, and build their future with confidence.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
          >
            <button
              type="button"
              onClick={() => navigate('/assessment')}
              className="px-7 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer group"
            >
              <span>Get Started</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-[#1A202C] font-extrabold text-sm transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Platform</span>
              <Compass size={16} className="text-[#2563EB]" />
            </button>
          </motion.div>
        </div>

        {/* ─── 2. PRODUCT WORKSPACE SHOWCASE (HERO MOCKUP) ──────────── */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Outer Glass Card */}
          <div className="rounded-3xl sm:rounded-[36px] bg-white border border-blue-100/90 shadow-2xl p-4 sm:p-7 relative overflow-hidden">
            {/* Top Product Bar */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400/80" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <span className="font-bold text-[#1A202C] ml-2">NeuroBridge Learning Workspace</span>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full">
                <Sparkles size={11} /> Dyslexia Mode Active
              </span>
            </div>

            {/* Inner Modular Workspace Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4.5 items-stretch">
              {/* Left Widget: Accessibility Calibration (4 Cols) */}
              <div className="md:col-span-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 p-4.5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB] flex items-center gap-1.5">
                      <Sliders size={13} /> Accessibility
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                      Calibrated
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-[#1A202C]">Sensory Comfort Engine</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    OpenDyslexic typography + comfortable 1.8x line-height.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-[#64748B]">Dyslexia Font</span>
                    <span className="font-bold text-purple-700">OpenDyslexic</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-[#64748B]">Text Scaling</span>
                    <span className="font-bold text-[#2563EB]">110%</span>
                  </div>
                </div>
              </div>

              {/* Center Widget: Learning Progress & Cognitive Milestone (4 Cols) */}
              <div className="md:col-span-4 rounded-2xl bg-white border border-blue-200 p-4.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <TrendingUp size={13} /> Learning Arena
                  </span>
                  <span className="text-[11px] font-black text-emerald-700">🔥 7-Day Streak</span>
                </div>

                <div>
                  <div className="text-2xl font-black text-[#1A202C]">84% Accuracy</div>
                  <p className="text-[11px] text-[#64748B] font-medium">
                    Sound Lab & Memory Vault milestones reached
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#2563EB] to-emerald-500 rounded-full w-4/5" />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-[#94A3B8]">
                    <span>Focus Score: 780</span>
                    <span className="text-emerald-600">+14% this week</span>
                  </div>
                </div>
              </div>

              {/* Right Widget: Resume Builder & Opportunities (4 Cols) */}
              <div className="md:col-span-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 p-4.5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB] flex items-center gap-1.5">
                      <FileText size={13} /> Career Launch
                    </span>
                    <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-1.5 py-0.2 rounded">
                      ATS Ready
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-[#1A202C]">Verified Student Resume</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Match inclusive internships and scholarships.
                  </p>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] font-extrabold text-[#1A202C] block">
                      Frontend Engineer Intern
                    </span>
                    <span className="text-[10px] text-[#64748B]">Neuro-Inclusive Employer</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Matched
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Top JARVIS Assistant Chip */}
            <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-[#8B5CF6] text-white flex items-center justify-center shrink-0">
                  <Bot size={13} />
                </div>
                <p className="font-bold text-[#1A202C] truncate">
                  <span className="text-[#8B5CF6]">JARVIS AI:</span> "Ready to guide you through
                  today's phonics sprint!"
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#2563EB] shrink-0">Voice & Chat Active</span>
            </div>
          </div>
        </motion.div>

        {/* ─── 3. TRUST & VALUE STRIP ───────────────────────────────── */}
        <div className="pt-4 border-t border-slate-200/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-blue-100/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="text-xs font-black text-[#1A202C]">Accessible by Design</div>
                <div className="text-[11px] text-[#64748B]">WCAG AAA Contrast</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-blue-100/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center shrink-0">
                <Bot size={18} />
              </div>
              <div>
                <div className="text-xs font-black text-[#1A202C]">AI-Powered Support</div>
                <div className="text-[11px] text-[#64748B]">Personalized JARVIS</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-blue-100/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Briefcase size={18} />
              </div>
              <div>
                <div className="text-xs font-black text-[#1A202C]">Career Readiness</div>
                <div className="text-[11px] text-[#64748B]">ATS Resume & Jobs</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-blue-100/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#E86F51] flex items-center justify-center shrink-0">
                <Users size={18} />
              </div>
              <div>
                <div className="text-xs font-black text-[#1A202C]">Inclusive Peer Circles</div>
                <div className="text-[11px] text-[#64748B]">Community & Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
