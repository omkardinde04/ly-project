import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Briefcase,
  Sliders,
  Bot,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Volume2,
  Type,
  Eye,
  Zap,
  ShieldCheck,
  Compass,
  Layers,
} from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';

export function Features() {
  const navigate = useNavigate();
  const { reduceMotion } = useDyslexia();

  const corePillars = [
    {
      title: 'Learn',
      subtitle: 'Adaptive Learning Arena',
      desc: 'Personalized reading sprints, phonological sound labs, and focus tracking calibrated to your assessment score.',
      icon: BookOpen,
      color: 'text-[#2563EB]',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      badge: 'Phonics & Memory',
    },
    {
      title: 'Build',
      subtitle: 'ATS Resume Builder',
      desc: 'Guided step-by-step resume creator with speech-to-text input, live paper preview, and instant PDF download.',
      icon: FileText,
      color: 'text-[#8B5CF6]',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      badge: 'Career Launch',
    },
    {
      title: 'Grow',
      subtitle: 'Inclusive Opportunities',
      desc: 'Discover verified scholarships, mentorships, and jobs from employers committed to neurodivergent strengths.',
      icon: Briefcase,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      badge: 'Peer Matching',
    },
    {
      title: 'Adapt',
      subtitle: 'Personalized Accessibility',
      desc: 'Instant OpenDyslexic font toggling, variable line & letter tracking, high contrast, and voice narration.',
      icon: Sliders,
      color: 'text-[#E86F51]',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      badge: 'Sensory Control',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 w-full">
      {/* ─── SECTION 1: WHAT IS NEUROBRIDGE? (4 CORE PILLARS) ────────── */}
      <section className="space-y-10">
        <div className="max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 text-xs font-extrabold">
            <Layers size={13} />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A202C] tracking-tight">
            One platform for your complete learning journey.
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] font-medium leading-relaxed">
            From cognitive phonics training to landing career opportunities, every tool inside
            NeuroBridge adapts to how your mind processes information best.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {corePillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                whileHover={reduceMotion ? {} : { y: -4 }}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl ${pillar.bg} ${pillar.color} ${pillar.border} border flex items-center justify-center`}
                    >
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-[#64748B] bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#1A202C] mb-1">{pillar.title}</h3>
                  <div className="text-xs font-bold text-[#2563EB] mb-2">{pillar.subtitle}</div>
                  <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── SECTION 2: JARVIS AI FEATURE SHOWCASE ───────────────────── */}
      <section className="bg-white rounded-3xl sm:rounded-[36px] border border-blue-100/90 shadow-xs p-6 sm:p-10 lg:p-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Description (6 Cols) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 text-[#8B5CF6] border border-purple-200 text-xs font-extrabold">
              <Bot size={14} />
              <span>Intelligent Study Companion</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[#1A202C] tracking-tight leading-tight">
              Meet JARVIS, your personal AI learning assistant.
            </h2>

            <p className="text-sm sm:text-base text-[#64748B] font-medium leading-relaxed">
              Get instant support understanding difficult concepts, simplifying complex texts,
              improving your resume, and organizing your study sprints through speech or text.
            </p>

            {/* Feature Bullets */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#1A202C]">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Multi-language voice and text interaction (English, Hindi, Marathi)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#1A202C]">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>One-tap simplification and speech-to-text narration</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#1A202C]">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Contextual study guides and resume improvement suggestions</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/learn')}
              className="px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore JARVIS AI</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Right Simulated JARVIS Chat UI (6 Cols) */}
          <div className="lg:col-span-6 rounded-3xl bg-[#F8FAFC] border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#8B5CF6] flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <span className="font-black text-[#1A202C]">JARVIS AI</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">● Active</span>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-blue-50 text-[#2563EB] px-2 py-0.5 rounded-full">
                Gemini Powered
              </span>
            </div>

            {/* Conversation Preview */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="ml-auto max-w-[85%] bg-[#2563EB] text-white p-3.5 rounded-2xl rounded-tr-xs font-medium">
                "Can you summarize this paragraph and explain the key ideas simply?"
              </div>

              <div className="mr-auto max-w-[90%] bg-white border border-blue-100 p-4 rounded-2xl rounded-tl-xs space-y-2 text-[#1A202C]">
                <p className="font-semibold text-xs leading-relaxed">
                  Here are the 3 key takeaways broken down into easy words:
                </p>
                <div className="space-y-1 text-xs text-[#64748B] pl-2 border-l-2 border-[#2563EB]">
                  <p>• Visual anchors stop letters from jumping on the page.</p>
                  <p>• Audio narration speeds up reading comprehension.</p>
                  <p>• Short sprints keep mental stamina high.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: ACCESSIBILITY SHOWCASE ─────────────────────────── */}
      <section className="bg-white rounded-3xl sm:rounded-[36px] border border-blue-100/90 shadow-xs p-6 sm:p-10 lg:p-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Interactive Accessibility Preview (6 Cols) */}
          <div className="lg:col-span-6 order-2 lg:order-1 rounded-3xl bg-[#F8FAFC] border border-slate-200 p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-[#1A202C] uppercase tracking-wider">
                Live Sensory Calibration
              </span>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                OpenDyslexic Mode
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 space-y-2">
              <h4 className="font-black text-base text-[#1A202C]" style={{ letterSpacing: '0.05em' }}>
                Letters that stay anchored.
              </h4>
              <p
                className="text-xs sm:text-sm text-[#64748B] leading-relaxed"
                style={{ lineHeight: '1.8', letterSpacing: '0.05em' }}
              >
                Heavy-weighted bottom letterforms eliminate flipping and inversion. Customize text
                scale, line height, and contrast in real time.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center gap-2">
                <Type size={15} className="text-[#2563EB]" />
                <span>Dynamic Font Scaling</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center gap-2">
                <Volume2 size={15} className="text-emerald-600" />
                <span>Text-to-Speech Engine</span>
              </div>
            </div>
          </div>

          {/* Right Description (6 Cols) */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">
              <Eye size={14} />
              <span>Accessibility First</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[#1A202C] tracking-tight leading-tight">
              Built around the way you learn and perceive.
            </h2>

            <p className="text-sm sm:text-base text-[#64748B] font-medium leading-relaxed">
              NeuroBridge avoids clinical or rigid interfaces. Personalize your workspace with calm
              contrast, OpenDyslexic typography, and speech synthesis to eliminate reading fatigue.
            </p>

            <button
              type="button"
              onClick={() => navigate('/learn')}
              className="px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 text-[#1A202C] font-bold text-xs sm:text-sm transition-all shadow-2xs inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Accessibility Features</span>
              <ArrowRight size={15} className="text-[#2563EB]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
