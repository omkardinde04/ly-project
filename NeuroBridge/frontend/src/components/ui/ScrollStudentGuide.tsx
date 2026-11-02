import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Volume2, Sparkles, X, ChevronUp, Bot, BookOpen, Compass, Award, Gamepad2, Chrome, Users, CheckCircle2 } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';

interface GuideSpeechItem {
  id: string;
  badge: string;
  text: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

// 5 Core Features strictly aligned with user requirements:
// 1. Play cognitive games
// 2. Chat with friends
// 3. Give test and assessment
// 4. Courses for dyslexic students
// 5. Google Chrome extension (download after giving test)
const guideSpeeches: GuideSpeechItem[] = [
  {
    id: 'hero',
    badge: 'Reading Buddy',
    text: "Hi! I'm Leo. Let's play brain games, learn with sensory courses, and chat with friends!",
    icon: Sparkles,
  },
  {
    id: 'games',
    badge: 'Play Brain Games',
    text: 'Train memory, phonics, and focus with interactive cognitive games in the Sound Lab!',
    icon: Gamepad2,
  },
  {
    id: 'courses',
    badge: 'Dyslexia Courses',
    text: 'Learn with visual, bite-sized courses designed around how your brain naturally learns best.',
    icon: BookOpen,
  },
  {
    id: 'assessment',
    badge: 'Assessment & Test',
    text: 'Take our 5-minute diagnostic test to discover your unique sensory profile and reading strengths.',
    icon: CheckCircle2,
  },
  {
    id: 'extension',
    badge: 'Chrome Extension',
    text: 'Download our official Chrome extension right after your test to read any website with ease!',
    icon: Chrome,
  },
  {
    id: 'friends',
    badge: 'Chat with Friends',
    text: 'Join inclusive peer circles to chat with friends, study together, and share tips!',
    icon: Users,
  },
  {
    id: 'cta',
    badge: 'Ready to Start',
    text: 'Take your assessment test today and unlock your personalized Chrome extension!',
    icon: Sparkles,
  },
];

type CharacterPose = 'front' | 'left' | 'right';

export function ScrollStudentGuide() {
  const { isDarkMode, reduceMotion, isDyslexiaMode } = useDyslexia();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [clickSparks, setClickSparks] = useState<number[]>([]);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState(0);
  const [activePose, setActivePose] = useState<CharacterPose>('front');

  // Global window scroll progress (0 at top, 1 at bottom)
  const { scrollYProgress } = useScroll();

  // Smooth spring physics for organic motion with inertia and zero jitter
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 26,
    stiffness: 80,
    mass: 0.6,
  });

  // Vertical subtle bobbing and tilt mapped to scroll progress
  // Pinned safely to the bottom-right corner to NEVER obscure any website content!
  const rawTilt = useTransform(
    smoothProgress,
    [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
    [0, -2, 2, -2, 1, 0]
  );

  const rawScale = useTransform(
    smoothProgress,
    [0.0, 0.15, 0.5, 0.85, 1.0],
    [1.0, 0.98, 1.02, 0.98, 1.04]
  );

  // Synchronize active pose and speech index with smoothProgress
  // Seamless reverse psychology: scrolling up rewinds poses and messages in exact reverse!
  useEffect(() => {
    const unsubscribe = smoothProgress.on('change', (latest) => {
      // 1. Pose Determination:
      // In Hero and Final CTA: Front greeting
      // During middle sections: Profile Left pointing ruler towards page content!
      if (latest < 0.14) {
        setActivePose('front');
      } else if (latest < 0.86) {
        // Points ruler inward towards the left content
        setActivePose('left');
      } else {
        setActivePose('front');
      }

      // 2. Speech Index Selection mapped to the 5 capabilities:
      if (latest < 0.14) {
        setActiveSpeechIndex(0); // Hero Welcome
      } else if (latest < 0.30) {
        setActiveSpeechIndex(1); // Brain Games
      } else if (latest < 0.46) {
        setActiveSpeechIndex(2); // Dyslexia Courses
      } else if (latest < 0.62) {
        setActiveSpeechIndex(3); // Assessment & Test
      } else if (latest < 0.78) {
        setActiveSpeechIndex(4); // Chrome Extension
      } else if (latest < 0.90) {
        setActiveSpeechIndex(5); // Chat with Friends
      } else {
        setActiveSpeechIndex(6); // Final CTA
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

    const currentText = guideSpeeches[activeSpeechIndex].text;
    const utterance = new SpeechSynthesisUtterance(currentText);
    utterance.rate = 0.95;
    utterance.pitch = 1.1; // Friendly tone for student buddy
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Fun click reaction: Leo jumps and emits playful sparkles
  const handleCharacterClick = () => {
    setClickSparks((prev) => [...prev, Date.now()]);
    setTimeout(() => {
      setClickSparks((prev) => prev.slice(1));
    }, 1200);
  };

  const currentSpeech = guideSpeeches[activeSpeechIndex];
  const IconComponent = currentSpeech.icon;

  if (isMinimized) {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={() => setIsMinimized(false)}
        className={`fixed bottom-5 right-5 z-40 px-3.5 py-2 rounded-full border shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 ${
          isDarkMode
            ? 'bg-slate-900/95 border-blue-500/40 text-blue-200 shadow-blue-950/40'
            : 'bg-white/95 border-blue-200 text-blue-900 shadow-blue-500/10'
        }`}
        title="Open Leo Reading Guide"
      >
        <span className="text-base">👦</span>
        <span className="text-xs font-bold tracking-tight">Show Leo</span>
        <ChevronUp size={14} className="text-blue-500" />
      </motion.button>
    );
  }

  return (
    <aside
      aria-label="Leo Reading Companion"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 pointer-events-auto select-none"
    >
      <motion.div
        style={
          reduceMotion
            ? {}
            : {
                rotate: rawTilt,
                scale: rawScale,
              }
        }
        className="relative flex flex-col items-end group"
      >
        {/* ─── DYSLEXIA-CALIBRATED SPEECH BUBBLE ────────────────────────── */}
        <motion.div
          key={currentSpeech.id}
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`mb-2 w-[220px] sm:w-[250px] p-3 rounded-2xl border shadow-xl backdrop-blur-md transition-all ${
            isDarkMode
              ? 'bg-slate-900/95 border-blue-500/35 text-white shadow-blue-950/50'
              : 'bg-white/95 border-blue-200 text-slate-800 shadow-blue-500/15'
          }`}
        >
          {/* Header: Badge & Controls */}
          <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-slate-200/60 dark:border-slate-800/80 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-[#2563EB] dark:text-blue-300">
              <IconComponent size={13} className="text-amber-500" />
              <span>Leo • {currentSpeech.badge}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleSpeakAloud}
                className={`p-1 rounded-md transition-colors hover:bg-blue-100 dark:hover:bg-slate-800 cursor-pointer ${
                  isSpeaking ? 'text-emerald-500 animate-pulse' : 'text-slate-500 dark:text-slate-400'
                }`}
                title={isSpeaking ? 'Stop voice reading' : 'Read tip aloud'}
                aria-label="Read tip aloud"
              >
                <Volume2 size={12} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                title="Minimize buddy"
                aria-label="Minimize buddy"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Speech Text */}
          <p
            className={`text-xs mt-1.5 leading-snug font-normal ${
              isDyslexiaMode ? 'font-dyslexia' : ''
            } ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}
          >
            {currentSpeech.text}
          </p>
        </motion.div>

        {/* ─── CLICK CONFETTI SPARKS ───────────────────────────────────── */}
        <AnimatePresence>
          {clickSparks.map((sparkId) => (
            <motion.div
              key={sparkId}
              initial={{ opacity: 1, y: 0, scale: 0.5 }}
              animate={{ opacity: 0, y: -45, scale: 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className="absolute -top-6 right-6 text-sm font-bold flex gap-1 pointer-events-none select-none z-50"
            >
              <span>✨</span>
              <span>🎮</span>
              <span>⭐</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ─── CHARACTER CONTAINER (COMPACT, NON-OBSTRUCTIVE & HOVER GHOST) ─── */}
        <motion.div
          animate={reduceMotion ? {} : { y: [0, -6, 0] }}
          transition={{
            duration: 3.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleCharacterClick}
          className="relative w-20 sm:w-24 lg:w-28 cursor-pointer group/char transition-opacity duration-200 hover:opacity-30"
          title="Click to celebrate with Leo! (Hover makes transparent to see through)"
        >
          {/* Soft Grounding Contact Shadow */}
          <div
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-3.5 rounded-full blur-sm transition-all ${
              isDarkMode
                ? 'bg-blue-500/30 shadow-blue-500/40'
                : 'bg-slate-900/15'
            }`}
          />

          <div className="relative w-full aspect-[686/1024]">
            {/* 1. FRONT POSE */}
            <img
              src="/assets/character/student-front.png"
              alt="NeuroBridge Reading Companion Leo"
              className={`absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.16)] dark:drop-shadow-[0_8px_20px_rgba(59,130,246,0.3)] transition-opacity duration-300 pointer-events-none ${
                activePose === 'front' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              draggable={false}
            />

            {/* 2. PROFILE LEFT POSE (Facing Left with Ruler pointing toward screen content) */}
            <img
              src="/assets/character/student-profile-left.png"
              alt="NeuroBridge Reading Companion Leo (Facing Content)"
              className={`absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.16)] dark:drop-shadow-[0_8px_20px_rgba(59,130,246,0.3)] transition-opacity duration-300 pointer-events-none ${
                activePose === 'left' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              draggable={false}
            />

            {/* 3. PROFILE RIGHT POSE */}
            <img
              src="/assets/character/student-profile-right.png"
              alt="NeuroBridge Reading Companion Leo (Facing Right)"
              className={`absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.16)] dark:drop-shadow-[0_8px_20px_rgba(59,130,246,0.3)] transition-opacity duration-300 pointer-events-none ${
                activePose === 'right' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              draggable={false}
            />
          </div>
        </motion.div>
      </motion.div>
    </aside>
  );
}
