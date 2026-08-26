import React from 'react';
import { motion } from 'framer-motion';
import { Clapperboard, MonitorPlay, Rocket, Palette, Zap, Waves, Sparkles } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';

export function GreatCompany() {
  const { reduceMotion } = useDyslexia();

  const people = [
    {
      icon: <Clapperboard size={20} />,
      quote: `"I was seen as the dumbest person in school. But movies let me think in pictures, not words."`,
      name: 'Steven Spielberg',
      role: "Legendary Film Director · Schindler's List, E.T.",
      accent: 'text-[#2563EB] bg-blue-50 border-blue-100',
    },
    {
      icon: <MonitorPlay size={20} />,
      quote: `"Creativity is just connecting things. Dyslexia made me see connections others missed."`,
      name: 'Steve Jobs',
      role: 'Co-founder, Apple · Visionary Innovator',
      accent: 'text-[#8B5CF6] bg-purple-50 border-purple-100',
    },
    {
      icon: <Rocket size={20} />,
      quote: `"My brain works differently — and that's exactly why I could imagine things no one else dared to."`,
      name: 'Richard Branson',
      role: 'Founder, Virgin Group · Entrepreneur',
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    },
    {
      icon: <Palette size={20} />,
      quote: `"I struggled to read as a child. But I could see beauty and tell stories that words couldn't capture."`,
      name: 'Leonardo da Vinci',
      role: 'Artist, Inventor & Polymath Genius',
      accent: 'text-[#E86F51] bg-orange-50 border-orange-100',
    },
    {
      icon: <Zap size={20} />,
      quote: `"My teachers gave up on me. I proved that the mind, not the grade, is the real measure of a person."`,
      name: 'Albert Einstein',
      role: 'Physicist · Nobel Prize Winner',
      accent: 'text-amber-700 bg-amber-50 border-amber-100',
    },
    {
      icon: <Waves size={20} />,
      quote: `"Dyslexia taught me to work harder and focus deeper. It's the reason I never gave up."`,
      name: 'Michael Phelps',
      role: '23× Olympic Gold Medalist',
      accent: 'text-cyan-700 bg-cyan-50 border-cyan-100',
    },
  ];

  return (
    <section className="space-y-10 text-left" aria-label="Inspirational Dyslexic Pioneers">
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 text-xs font-extrabold">
          <Sparkles size={13} />
          <span>You're in Great Company</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A202C] tracking-tight">
          Dyslexia didn't stop them. It shaped them.
        </h2>
        <p className="text-sm sm:text-base text-[#64748B] font-medium leading-relaxed">
          Some of the world's greatest innovators, artists, and leaders think differently—just like you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((person) => (
          <motion.div
            key={person.name}
            whileHover={reduceMotion ? {} : { y: -4 }}
            className="bg-white rounded-3xl p-7 border border-blue-100/80 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div
                className={`w-10 h-10 rounded-2xl ${person.accent} border flex items-center justify-center mb-5`}
              >
                {person.icon}
              </div>

              <p className="text-xs sm:text-sm text-[#1A202C] italic leading-relaxed mb-6 font-medium">
                {person.quote}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-[#1A202C]">{person.name}</h4>
                <p className="text-[11px] text-[#64748B] font-medium mt-0.5">{person.role}</p>
              </div>
              <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 shrink-0">
                Think Different
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
