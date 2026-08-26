import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { Hero } from '../sections/Hero';
import { Features } from '../sections/Features';
import { HowItWorks } from '../sections/HowItWorks';
import { GreatCompany } from '../sections/GreatCompany';
import { CommunitySectionPreview } from '../sections/CommunitySectionPreview';

export default function Index() {
  const navigate = useNavigate();
  const { reduceMotion } = useDyslexia();

  return (
    <div className="w-full space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section (Product Workspace Showcase & Value Strip) */}
      <div id="hero-section">
        <Hero />
      </div>

      {/* 2. Core Features & Capabilities Container */}
      <div id="features-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Features />
      </div>

      {/* 3. How It Works (3-Step Progression) */}
      <div id="how-it-works-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HowItWorks />
      </div>

      {/* 4. You're in Great Company (Dyslexic Pioneers) */}
      <div id="great-company-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GreatCompany />
      </div>

      {/* 5. Community Section Preview */}
      <div id="community-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CommunitySectionPreview />
      </div>

      {/* 6. Final Call to Action Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl sm:rounded-[40px] bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 border border-blue-200/80 p-8 sm:p-14 lg:p-16 text-center space-y-6 shadow-xs relative overflow-hidden"
        >
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-[#2563EB] border border-blue-200 text-xs font-extrabold shadow-2xs">
            <Sparkles size={13} className="text-[#8B5CF6]" />
            <span>Empowering Every Mind</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A202C] tracking-tight leading-tight max-w-2xl mx-auto">
            Your way of learning starts right here.
          </h2>

          <p className="text-sm sm:text-base text-[#64748B] font-medium leading-relaxed max-w-xl mx-auto">
            Build confidence, discover your cognitive strengths, and move forward with an
            accessibility-first learning ecosystem.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={() => navigate('/assessment')}
              className="px-8 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer group"
            >
              <span>Get Started Now</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>

            <button
              type="button"
              onClick={() => navigate('/learn')}
              className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-[#1A202C] font-extrabold text-sm transition-all shadow-2xs cursor-pointer"
            >
              Explore Learning Platform
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}