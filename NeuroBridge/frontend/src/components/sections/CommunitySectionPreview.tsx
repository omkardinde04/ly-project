import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, BookOpen, Lightbulb, ArrowRight } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';

export function CommunitySectionPreview() {
  const navigate = useNavigate();
  const { isDarkMode, reduceMotion, isDyslexiaMode } = useDyslexia();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const springConfig = { damping: 24, stiffness: 90 };

  const rawCard1Y = useTransform(scrollYProgress, [0, 1], [25, -25]);
  const card1Y = useSpring(rawCard1Y, springConfig);

  const rawCard2Y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const card2Y = useSpring(rawCard2Y, springConfig);

  const rawCard3Y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const card3Y = useSpring(rawCard3Y, springConfig);

  const cardParallax = [card1Y, card2Y, card3Y];

  const previewCards = [
    {
      id: '1',
      icon: MessageSquare,
      title: 'Multisensory Phonics Hacks',
      desc: 'How I use rhythmic clapping and audio narration to master tricky syllable breakdowns.',
      author: 'Aarav M. · 12th Grade Student',
      tag: 'Phonics Strategy',
      color: 'text-[#2563EB]',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      border: 'border-blue-200 dark:border-blue-900',
    },
    {
      id: '2',
      icon: BookOpen,
      title: 'Reading Without Exhaustion',
      desc: 'Setting my line spacing to 1.8x and using 15-minute intervals transformed my exams.',
      author: 'Priya K. · College Freshman',
      tag: 'Study Habit',
      color: 'text-[#7C3AED]',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      border: 'border-purple-200 dark:border-purple-900',
    },
    {
      id: '3',
      icon: Lightbulb,
      title: 'Studying in Friend Chat Circles',
      desc: 'Our study group uses peer audio chat and shared brain game sprints to master dense chapters together.',
      author: 'Rohan D. · 11th Grade Student',
      tag: 'Friend Chat & Games',
      color: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      border: 'border-emerald-200 dark:border-emerald-900',
    },
  ];

  return (
    <section ref={sectionRef} className="space-y-12 text-left" aria-label="Community Support Preview">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
            <Users size={14} />
            <span>Inclusive Peer Circles</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            You don't have to learn alone.
          </h2>
          <p className={`text-base sm:text-lg font-normal leading-relaxed ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Connect with fellow students, exchange proven dyslexia study strategies, and grow alongside
            a supportive neuro-inclusive community.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/community')}
          className="px-7 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Join the Community</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* 3-Card Grid with Parallax Floating */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {previewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              style={reduceMotion || isDyslexiaMode ? {} : { y: cardParallax[index] }}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              whileHover={reduceMotion ? {} : { y: -6, transition: { duration: 0.2 } }}
              onClick={() => navigate('/community')}
              className={`rounded-2xl p-7 border transition-all duration-300 flex flex-col justify-between cursor-pointer group ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-800 text-white shadow-xs hover:border-slate-700'
                  : 'bg-white border-slate-200 shadow-xs hover:border-slate-300 text-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-11 h-11 rounded-2xl ${card.bg} ${card.color} ${card.border} border flex items-center justify-center shadow-2xs`}
                  >
                    <Icon size={22} />
                  </div>
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                    isDarkMode 
                      ? 'bg-slate-800 text-slate-300 border-slate-700' 
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {card.tag}
                  </span>
                </div>

                <h3 className={`text-lg font-bold group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors mb-2 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {card.title}
                </h3>
                <p className={`text-xs sm:text-sm font-normal leading-relaxed mb-6 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {card.desc}
                </p>
              </div>

              <div className={`pt-4 border-t flex items-center justify-between text-xs ${
                isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}>
                <span className="text-[11px] font-normal">{card.author}</span>
                <span className="text-[#2563EB] dark:text-blue-400 group-hover:translate-x-1 transition-transform">
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
