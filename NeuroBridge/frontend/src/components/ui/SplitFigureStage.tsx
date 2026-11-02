import React, { useState, useEffect } from 'react';
import { motion, useSpring, AnimatePresence, type MotionValue } from 'framer-motion';
import {
  Volume2,
  Sparkles,
  Gamepad2,
  BookOpen,
  CheckCircle2,
  Chrome,
  Users,
} from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';

interface SplitFigureStageProps {
  scrollYProgress: MotionValue<number>;
}

interface SectionMilestone {
  id: string;
  sectionId: string;
  badge: string;
  title: string;
  quote: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tag: string;
}

const milestones: SectionMilestone[] = [
  {
    id: 'hero',
    sectionId: 'hero-section',
    badge: 'Reading Buddy',
    title: 'Welcome to NeuroBridge',
    quote: "Hi, I'm Leo! Ready to explore learning calibrated for how your mind works best?",
    icon: Sparkles,
    tag: 'Sensory Comfort Engine',
  },
  {
    id: 'games',
    sectionId: 'games-section',
    badge: 'Cognitive Arena',
    title: 'Play Brain Games',
    quote: 'My favorite is the Sound Lab! Interactive phonics & memory games build speed with zero stress.',
    icon: Gamepad2,
    tag: 'Sound Lab & Memory Vault',
  },
  {
    id: 'courses',
    sectionId: 'courses-section',
    badge: 'Multisensory Paths',
    title: 'Dyslexia Courses',
    quote: 'My reading ruler keeps lines steady so words and letters don’t dance around the page!',
    icon: BookOpen,
    tag: 'Visual & Audio Sprints',
  },
  {
    id: 'assessment',
    sectionId: 'assessment-section',
    badge: 'Cognitive Calibration',
    title: 'Diagnostic Test',
    quote: 'Take the quick 5-minute test to unlock your personal typography and line-spacing profile.',
    icon: CheckCircle2,
    tag: '5-Min Pressure-Free Test',
  },
  {
    id: 'extension',
    sectionId: 'extension-section',
    badge: 'Browser Companion',
    title: 'Google Chrome Extension',
    quote: 'Download our Chrome extension right after your test to bring your ruler & font to any website!',
    icon: Chrome,
    tag: 'Instant Post-Test Download',
  },
  {
    id: 'community',
    sectionId: 'community-section',
    badge: 'Peer Support',
    title: 'Chat with Friends',
    quote: 'You are never alone. Join study groups, audio rooms, and chat with dyslexic peers anytime!',
    icon: Users,
    tag: 'Inclusive Friend Circles',
  },
];

type CharacterPose = 'front' | 'left' | 'right';

export function SplitFigureStage({ scrollYProgress }: SplitFigureStageProps) {
  const { isDarkMode, reduceMotion, isDyslexiaMode } = useDyslexia();
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);
  const [activePose, setActivePose] = useState<CharacterPose>('front');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [clickSparks, setClickSparks] = useState<number[]>([]);

  // Preload all 3 character images immediately to ensure zero flickering or blank frames
  useEffect(() => {
    const imagesToPreload = [
      '/assets/character/student-front.png',
      '/assets/character/student-profile-left.png',
      '/assets/character/student-profile-right.png',
    ];
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Smooth spring physics for organic motion with realistic damping
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 24,
    stiffness: 80,
    mass: 0.6,
  });

  // Sync active milestone & pose with scroll progress
  // Reversible sequence:
  // 1. Hero: front
  // 2. Games: left profile (pointing ruler at Sound Lab on the left)
  // 3. Courses: right profile (turned with ruler to courses)
  // 4. Assessment: left profile (pointing ruler at diagnostic test)
  // 5. Chrome Extension: right profile (gesturing to extension download)
  // 6. Friends & Community: left profile (connecting with peer stories)
  useEffect(() => {
    const unsubscribe = smoothProgress.on('change', (latest) => {
      if (latest < 0.16) {
        setActiveMilestoneIndex(0); // Hero
        setActivePose('front');
      } else if (latest < 0.32) {
        setActiveMilestoneIndex(1); // Games
        setActivePose('left'); // Pointing ruler toward left content
      } else if (latest < 0.48) {
        setActiveMilestoneIndex(2); // Courses
        setActivePose('right'); // Transition toward right profile
      } else if (latest < 0.64) {
        setActiveMilestoneIndex(3); // Assessment Test
        setActivePose('left'); // Pointing ruler toward assessment test
      } else if (latest < 0.80) {
        setActiveMilestoneIndex(4); // Chrome Extension
        setActivePose('right'); // Transition toward right profile
      } else {
        setActiveMilestoneIndex(5); // Friends Chat
        setActivePose('left'); // Pointing ruler toward friend circles
      }
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  // Audio Speech Reader using Web Speech API
  const handleSpeakAloud = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const currentText = milestones[activeMilestoneIndex].quote;
    const utterance = new SpeechSynthesisUtterance(currentText);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Fun click reaction: Leo jumps with sparkles
  const handleCharacterClick = () => {
    setClickSparks((prev) => [...prev, Date.now()]);
    setTimeout(() => {
      setClickSparks((prev) => prev.slice(1));
    }, 1200);
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentMilestone = milestones[activeMilestoneIndex];
  const Icon = currentMilestone.icon;

  return (
    <div className={`w-full h-full flex flex-col justify-between items-center p-6 xl:p-10 relative overflow-hidden transition-colors duration-500 select-none ${
      isDarkMode
        ? 'bg-gradient-to-b from-slate-900/40 via-[#0B1120]/60 to-slate-950/80 text-white'
        : 'bg-gradient-to-b from-blue-50/30 via-white/40 to-indigo-50/20 text-slate-900'
    }`}>
      {/* ─── AMBIENT BACKGROUND GLOW & 3D ORBITAL RING ───────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] xl:w-[480px] h-[380px] xl:h-[480px] rounded-full blur-[110px] transition-all duration-700 ${
          isDarkMode ? 'bg-blue-600/15' : 'bg-blue-100/50'
        }`} />
        <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full blur-[90px] transition-all duration-700 ${
          isDarkMode ? 'bg-purple-600/12' : 'bg-amber-100/35'
        }`} />
        {/* Subtle decorative golden orbital ring */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] xl:w-[500px] h-[400px] xl:h-[500px] rounded-full border border-dashed transition-all duration-700 ${
          isDarkMode ? 'border-blue-500/15' : 'border-amber-400/20'
        }`} />
      </div>

      {/* ─── 1. TOP STAGE HEADER: SECTION PILL & TTS LISTEN BUTTON ─────── */}
      <div className="w-full relative z-10 flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
            <Icon size={17} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] dark:text-blue-400 block leading-tight">
              {currentMilestone.badge}
            </span>
            <span className={`text-xs sm:text-sm font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {currentMilestone.title}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSpeakAloud}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 ${
            isSpeaking
              ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse'
              : isDarkMode
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:text-[#2563EB] shadow-2xs'
          }`}
          title={isSpeaking ? 'Stop voice guide' : 'Listen to Leo read aloud'}
          aria-label="Listen to Leo read aloud"
        >
          <Volume2 size={13} />
          <span className="text-[11px]">{isSpeaking ? 'Speaking...' : 'Listen'}</span>
        </button>
      </div>

      {/* ─── 2. CENTER STAGE: SPEECH BUBBLE & PERSISTENT 3D CHARACTER ─── */}
      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-10 py-2">
        {/* DYNAMIC SPEECH BUBBLE */}
        <motion.div
          key={currentMilestone.id}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`w-full max-w-[340px] xl:max-w-[380px] p-4 rounded-2xl border shadow-lg backdrop-blur-md relative mb-4 text-left ${
            isDarkMode
              ? 'bg-slate-900/95 border-blue-500/30 text-white shadow-blue-950/40'
              : 'bg-white/95 border-blue-200 text-slate-800 shadow-blue-500/10'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2563EB] dark:text-blue-300 pb-1.5 border-b border-slate-200/60 dark:border-slate-800/80">
            <Sparkles size={13} className="text-amber-500" />
            <span>Leo's Reading Guide</span>
          </div>

          <p className={`text-xs sm:text-sm mt-2 leading-relaxed font-normal ${
            isDyslexiaMode ? 'font-dyslexia' : ''
          } ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            "{currentMilestone.quote}"
          </p>

          {/* Speech arrow tail pointing down toward Leo */}
          <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-r border-b ${
            isDarkMode ? 'bg-slate-900 border-blue-500/30' : 'bg-white border-blue-200'
          }`} />
        </motion.div>

        {/* CLICK CONFETTI SPARKS */}
        <AnimatePresence>
          {clickSparks.map((sparkId) => (
            <motion.div
              key={sparkId}
              initial={{ opacity: 1, y: 0, scale: 0.5 }}
              animate={{ opacity: 0, y: -50, scale: 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className="absolute top-1/4 text-lg font-bold flex gap-1 pointer-events-none select-none z-50"
            >
              <span>✨</span>
              <span>🎮</span>
              <span>🚀</span>
              <span>⭐</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ─── 3D CHARACTER SPRITE WITH SMOOTH 500MS CROSSFADE ─────────── */}
        <motion.div
          animate={reduceMotion ? {} : { y: [0, -6, 0] }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative w-[230px] sm:w-[270px] lg:w-[300px] xl:w-[340px] 2xl:w-[380px] aspect-[686/1024] cursor-pointer group"
          onClick={handleCharacterClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          title="Click Leo to celebrate!"
        >
          {/* Grounding Contact Shadow Under Sneakers */}
          <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-4/5 h-6 rounded-full blur-md transition-all ${
            isDarkMode ? 'bg-blue-500/35 shadow-blue-500/40' : 'bg-slate-900/18'
          }`} />

          {/* 1. FRONT POSE */}
          <img
            src="/assets/character/student-front.png"
            alt="Leo - Reading Guide (Front)"
            className={`absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.20)] dark:drop-shadow-[0_16px_36px_rgba(59,130,246,0.30)] transition-opacity duration-500 ease-in-out pointer-events-none ${
              activePose === 'front' ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            draggable={false}
          />

          {/* 2. PROFILE LEFT POSE (Pointing Ruler Left Towards Content!) */}
          <img
            src="/assets/character/student-profile-left.png"
            alt="Leo - Reading Guide (Pointing at Content)"
            className={`absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.20)] dark:drop-shadow-[0_16px_36px_rgba(59,130,246,0.30)] transition-opacity duration-500 ease-in-out pointer-events-none ${
              activePose === 'left' ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            draggable={false}
          />

          {/* 3. PROFILE RIGHT POSE (Turning with Ruler) */}
          <img
            src="/assets/character/student-profile-right.png"
            alt="Leo - Reading Guide (Right Profile)"
            className={`absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.20)] dark:drop-shadow-[0_16px_36px_rgba(59,130,246,0.30)] transition-opacity duration-500 ease-in-out pointer-events-none ${
              activePose === 'right' ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            draggable={false}
          />
        </motion.div>
      </div>

      {/* ─── 3. BOTTOM STAGE: ACTIVE TAG & INTERACTIVE SECTION JUMP DOTS ─ */}
      <div className="w-full relative z-10 pt-1 flex flex-col items-center gap-2.5">
        {/* Contextual Active Tag */}
        <div className={`px-3.5 py-1 rounded-full border text-[11px] font-bold tracking-tight transition-all flex items-center gap-1.5 ${
          isDarkMode
            ? 'bg-slate-800/80 border-slate-700 text-blue-300'
            : 'bg-white border-blue-200 text-[#2563EB] shadow-2xs'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{currentMilestone.tag}</span>
        </div>

        {/* Quick Section Jump Indicators */}
        <div className="flex items-center gap-2 pt-0.5">
          {milestones.map((m, idx) => (
            <button
              key={m.id}
              type="button"
              onClick={() => scrollToSection(m.sectionId)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeMilestoneIndex === idx
                  ? 'w-7 bg-[#2563EB] shadow-xs'
                  : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
              }`}
              title={`Jump to ${m.title}`}
              aria-label={`Jump to ${m.title}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
