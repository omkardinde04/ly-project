import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
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
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

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
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-40px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          onMouseMove={handleMouseMove}
          className="group rounded-3xl sm:rounded-[40px] bg-gradient-to-br from-[#1E3A8A] via-[#172554] to-[#0F172A] border border-blue-800 p-8 sm:p-14 lg:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden"
        >
          {/* Spotlight Effect */}
          {!reduceMotion && (
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
              style={{
                background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.06), transparent 40%)`,
              }}
            />
          )}

          {/* Subtle Ambient Orbs */}
          {!reduceMotion && (
            <>
              <motion.div 
                 animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
                 transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute -top-24 -left-20 w-72 h-72 bg-blue-600/20 blur-[90px] rounded-full pointer-events-none"
              />
              <motion.div 
                 animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
                 transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                 className="absolute -bottom-32 -right-24 w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none"
              />
            </>
          )}

          <div className="relative z-10 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-900/30 text-blue-200 border border-blue-500/30 backdrop-blur-sm text-xs font-extrabold shadow-inner">
            <Sparkles size={13} className="text-blue-300" />
            <span>Empowering Every Mind</span>
          </div>

          <h2 className="relative z-10 text-3xl sm:text-4xl lg:text-5xl font-black text-white !text-white tracking-tight leading-tight max-w-2xl mx-auto drop-shadow-sm">
            Your way of learning starts right here.
          </h2>

          <p className="relative z-10 text-sm sm:text-base text-blue-50 font-medium leading-relaxed max-w-xl mx-auto">
            Build confidence, discover your cognitive strengths, and move forward with an
            accessibility-first learning ecosystem.
          </p>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={() => navigate('/assessment')}
              className="px-8 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#3B82F6] text-white font-extrabold text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] border border-blue-400/20 transition-all duration-300 flex items-center gap-2 cursor-pointer group"
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
              className="px-7 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white backdrop-blur-md font-extrabold text-sm transition-all shadow-sm cursor-pointer"
            >
              Explore Learning Platform
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}