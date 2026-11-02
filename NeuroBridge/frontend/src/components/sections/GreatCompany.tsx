import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Clapperboard, MonitorPlay, Rocket, Palette, Zap, Waves, Sparkles } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';

export function GreatCompany() {
  const { isDarkMode, reduceMotion, isDyslexiaMode } = useDyslexia();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const springConfig = { damping: 24, stiffness: 90 };

  const rawCol1Y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const col1Y = useSpring(rawCol1Y, springConfig);

  const rawCol2Y = useTransform(scrollYProgress, [0, 1], [65, -65]);
  const col2Y = useSpring(rawCol2Y, springConfig);

  const rawCol3Y = useTransform(scrollYProgress, [0, 1], [25, -25]);
  const col3Y = useSpring(rawCol3Y, springConfig);

  const colParallax = [col1Y, col2Y, col3Y, col1Y, col2Y, col3Y];

  const people = [
    {
      icon: <Clapperboard size={20} />,
      quote: `"I was seen as the dumbest person in school. But movies let me think in pictures, not words."`,
      name: 'Steven Spielberg',
      role: "Legendary Film Director · Schindler's List, E.T.",
      accent: 'text-[#2563EB] bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900',
      tag: 'Think in Pictures',
    },
    {
      icon: <MonitorPlay size={20} />,
      quote: `"Creativity is just connecting things. Dyslexia made me see connections others missed."`,
      name: 'Steve Jobs',
      role: 'Co-founder, Apple · Visionary Innovator',
      accent: 'text-[#7C3AED] bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900',
      tag: 'Connect Ideas',
    },
    {
      icon: <Rocket size={20} />,
      quote: `"My brain works differently — and that's exactly why I could imagine things no one else dared to."`,
      name: 'Richard Branson',
      role: 'Founder, Virgin Group · Entrepreneur',
      accent: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900',
      tag: 'Vivid Imagination',
    },
    {
      icon: <Palette size={20} />,
      quote: `"I struggled to read as a child. But I could see beauty and tell stories that words couldn't capture."`,
      name: 'Leonardo da Vinci',
      role: 'Artist, Inventor & Polymath Genius',
      accent: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
      tag: 'Visual Thinking',
    },
    {
      icon: <Zap size={20} />,
      quote: `"My teachers gave up on me. I proved that the mind, not the grade, is the real measure of a person."`,
      name: 'Albert Einstein',
      role: 'Physicist · Nobel Prize Winner',
      accent: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
      tag: 'Deep Curiosity',
    },
    {
      icon: <Waves size={20} />,
      quote: `"Dyslexia taught me to work harder and focus deeper. It's the reason I never gave up."`,
      name: 'Michael Phelps',
      role: '23× Olympic Gold Medalist',
      accent: 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-900',
      tag: 'Relentless Focus',
    },
  ];

  return (
    <section ref={sectionRef} className="space-y-12 text-left" aria-label="Inspirational Dyslexic Pioneers">
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
          <Sparkles size={14} />
          <span>You're in Great Company</span>
        </div>
        <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          Dyslexia didn't stop them. It shaped them.
        </h2>
        <p className={`text-base sm:text-lg font-normal leading-relaxed ${
          isDarkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Some of the world's greatest innovators, artists, and leaders think differently—just like you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
        {people.map((person, index) => (
          <motion.div
            key={person.name}
            style={reduceMotion || isDyslexiaMode ? {} : { y: colParallax[index] }}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: (index % 3) * 0.1 }}
            whileHover={reduceMotion ? {} : { y: -6, transition: { duration: 0.2 } }}
            className={`rounded-2xl p-7 border transition-all duration-300 flex flex-col justify-between ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-white shadow-xs hover:border-slate-700'
                : 'bg-white border-slate-200 shadow-xs hover:border-slate-300 text-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div
                  className={`w-10 h-10 rounded-2xl ${person.accent} border flex items-center justify-center shadow-2xs`}
                >
                  {person.icon}
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                  isDarkMode 
                    ? 'bg-slate-800 text-slate-300 border-slate-700' 
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {person.tag}
                </span>
              </div>

              {/* Natural, comfortable quote text */}
              <p className={`text-xs sm:text-sm italic leading-relaxed mb-6 font-normal ${
                isDarkMode ? 'text-slate-200' : 'text-slate-600'
              }`}>
                {person.quote}
              </p>
            </div>

            <div className={`pt-4 border-t flex items-center justify-between ${
              isDarkMode ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div>
                <h4 className={`font-bold text-sm tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {person.name}
                </h4>
                <p className={`text-xs font-normal mt-0.5 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {person.role}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
