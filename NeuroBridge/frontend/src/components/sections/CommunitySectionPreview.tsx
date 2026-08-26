import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  BookOpen,
  Headphones,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Heart,
  Share2,
} from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';

export function CommunitySectionPreview() {
  const navigate = useNavigate();
  const { reduceMotion } = useDyslexia();

  const previewCards = [
    {
      id: 'reading',
      icon: BookOpen,
      color: 'text-[#2563EB]',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      title: 'Reading Strategies',
      desc: 'Discover line-tracking and sensory contrast techniques shared by dyslexic learners.',
      author: 'Aarav S. · 24 Peers discussing',
    },
    {
      id: 'learning',
      icon: Headphones,
      color: 'text-[#8B5CF6]',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      title: 'Multisensory Phonics',
      desc: 'Explore audio-guided phonics sprints and memory anchor workflows.',
      author: 'Sarah J. · 38 Peers discussing',
    },
    {
      id: 'career',
      icon: ShieldCheck,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      title: 'Career & Interview Prep',
      desc: 'Tips for disclosing neurodiversity, requesting accommodations, and highlighting strengths.',
      author: 'Elena R. · 52 Peers discussing',
    },
  ];

  return (
    <section className="space-y-10 text-left" aria-label="Community Support Preview">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 text-xs font-extrabold">
            <Users size={13} />
            <span>Inclusive Peer Circles</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A202C] tracking-tight">
            You don't have to learn alone.
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] font-medium leading-relaxed">
            Connect with fellow students, exchange proven learning strategies, and grow alongside a
            supportive neuro-inclusive community.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/community')}
          className="px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <span>Join the Community</span>
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {previewCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              whileHover={reduceMotion ? {} : { y: -4 }}
              onClick={() => navigate('/community')}
              className="bg-white rounded-3xl p-7 border border-blue-100/80 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div
                  className={`w-11 h-11 rounded-2xl ${card.bg} ${card.color} ${card.border} border flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}
                >
                  <Icon size={22} />
                </div>

                <h3 className="text-lg font-black text-[#1A202C] group-hover:text-[#2563EB] transition-colors mb-2">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed mb-6">
                  {card.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#64748B]">
                <span className="text-[11px] text-[#94A3B8]">{card.author}</span>
                <span className="text-[#2563EB] group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
