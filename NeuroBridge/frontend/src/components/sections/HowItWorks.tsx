import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Sparkles, Rocket, ArrowRight } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';

export function HowItWorks() {
  const { reduceMotion } = useDyslexia();

  const steps = [
    {
      number: '01',
      title: 'Personalize Your Profile',
      desc: 'Complete a brief 5-minute phonological and visual assessment to calibrate your typography, contrast, and learning profile.',
      icon: UserCheck,
      color: 'text-[#2563EB]',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      number: '02',
      title: 'Learn & Adapt with AI',
      desc: 'Engage in multisensory reading sprints, practice phonics labs, and get instant explanations from JARVIS AI.',
      icon: Sparkles,
      color: 'text-[#8B5CF6]',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
    {
      number: '03',
      title: 'Grow & Launch Career',
      desc: 'Build an ATS-optimized resume, showcase neuro-inclusive strengths, and connect directly with inclusive hiring partners.',
      icon: Rocket,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
  ];

  return (
    <section className="space-y-10 text-left" aria-label="How NeuroBridge Works">
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 text-xs font-extrabold">
          <span>Three Simple Steps</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A202C] tracking-tight">
          How NeuroBridge works for you.
        </h2>
        <p className="text-sm sm:text-base text-[#64748B] font-medium leading-relaxed">
          No complicated setup or judgment. NeuroBridge meets you where you are and tunes the
          learning experience to your strengths.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              whileHover={reduceMotion ? {} : { y: -5 }}
              className="bg-white rounded-3xl p-7 sm:p-8 border border-blue-100/80 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-black text-[#2563EB]/40">{step.number}</span>
                  <div
                    className={`w-12 h-12 rounded-2xl ${step.bg} ${step.color} ${step.border} border flex items-center justify-center`}
                  >
                    <Icon size={24} />
                  </div>
                </div>

                <h3 className="text-xl font-black text-[#1A202C] mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
