import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { UserCheck, Sparkles, Rocket, Check, Chrome, Gamepad2, Download } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';

export function HowItWorks() {
  const { isDarkMode, reduceMotion, isDyslexiaMode } = useDyslexia();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const springConfig = { damping: 24, stiffness: 90 };

  const rawStepY1 = useTransform(scrollYProgress, [0, 1], [25, -25]);
  const stepY1 = useSpring(rawStepY1, springConfig);

  const rawStepY2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const stepY2 = useSpring(rawStepY2, springConfig);

  const rawStepY3 = useTransform(scrollYProgress, [0, 1], [75, -75]);
  const stepY3 = useSpring(rawStepY3, springConfig);

  const rawLineWidth = useTransform(scrollYProgress, [0.2, 0.7], ["0%", "100%"]);
  const lineWidth = useSpring(rawLineWidth, springConfig);

  const steps = [
    {
      number: '01',
      title: 'Take the Assessment Test',
      desc: 'Take an engaging, judgment-free 5-minute diagnostic assessment to identify your reading strengths and sensory preferences.',
      icon: UserCheck,
      color: 'text-[#2563EB] dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      border: 'border-blue-200 dark:border-blue-800',
      tag: '5-Min Assessment',
      parallaxY: stepY1,
    },
    {
      number: '02',
      title: 'Play Games & Learn Courses',
      desc: 'Train your brain with cognitive games in the Sound Lab, level up your memory, and study visual, dyslexia-calibrated courses.',
      icon: Gamepad2,
      color: 'text-[#7C3AED] dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      border: 'border-purple-200 dark:border-purple-800',
      tag: 'Games & Courses',
      parallaxY: stepY2,
    },
    {
      number: '03',
      title: 'Download Chrome Extension',
      desc: 'Immediately download our Chrome extension after your test to bring your customized font, ruler, and speech to any webpage.',
      icon: Chrome,
      color: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      border: 'border-emerald-200 dark:border-emerald-800',
      tag: 'Unlocks Post-Test',
      parallaxY: stepY3,
    },
  ];

  return (
    <section ref={sectionRef} className="space-y-12 text-left relative" aria-label="How NeuroBridge Works">
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
          <Check size={14} />
          <span>Three Simple Steps</span>
        </div>
        <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          How NeuroBridge works for you.
        </h2>
        <p className={`text-base sm:text-lg font-normal leading-relaxed ${
          isDarkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          No complex setup or overwhelming quizzes. NeuroBridge meets you where you are and tunes the
          learning experience to your cognitive strengths.
        </p>
      </div>

      {/* Parallax Connector Rail (Desktop) */}
      {!reduceMotion && !isDyslexiaMode && (
        <div className="hidden md:block absolute top-[280px] inset-x-8 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10">
          <motion.div 
            style={{ width: lineWidth }}
            className="h-full bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-emerald-500 rounded-full"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              style={reduceMotion || isDyslexiaMode ? {} : { y: step.parallaxY }}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              whileHover={reduceMotion ? {} : { y: -6, transition: { duration: 0.2 } }}
              className={`rounded-2xl p-7 sm:p-8 border transition-all duration-300 flex flex-col justify-between ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-800 text-white shadow-xs hover:border-slate-700'
                  : 'bg-white border-slate-200 shadow-xs hover:border-slate-300 text-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black text-[#2563EB]/40 dark:text-blue-400/40">
                    {step.number}
                  </span>
                  <div
                    className={`w-12 h-12 rounded-2xl ${step.bg} ${step.color} ${step.border} border flex items-center justify-center shadow-2xs`}
                  >
                    <Icon size={24} />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {step.title}
                  </h3>
                </div>

                <span className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full border mb-3 ${
                  isDarkMode 
                    ? 'bg-slate-800 text-slate-300 border-slate-700' 
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {step.tag}
                </span>

                <p className={`text-xs sm:text-sm font-normal leading-relaxed ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
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
