import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';

type StepType = 'KEYPRESS' | 'CLICK';

interface ActivityStep {
  label: string;
  type: StepType;
  expectedValue: string;
  icon: string;
}

export interface FollowStepsData {
  activity_id: number;
  first_action_delay_ms: number | null;
  step_delays_ms: number[];
  sequence_errors: number;
  wrong_key_count: number;
  extra_click_count: number;
  completion_rate: number;
  total_time_ms: number;
}

const ACTIVITY: ActivityStep[] = [
  { label: 'CLICK', type: 'CLICK', expectedValue: 'blue-circle', icon: '🔵' },
  { label: 'PRESS', type: 'KEYPRESS', expectedValue: 'ArrowLeft', icon: '←' },
  { label: 'TYPE', type: 'KEYPRESS', expectedValue: 'a', icon: 'A' },
];

const SHOW_DURATION_MS = 4000;

interface FollowStepsProps {
  onComplete?: (data: FollowStepsData) => void;
}

export function MissionControlTask({ onComplete }: FollowStepsProps) {
  type Phase = 'ready' | 'instructions' | 'playing' | 'done' | 'timeout';
  const [phase, setPhase] = useState<Phase>('ready');
  const [completedSteps, setCompletedSteps] = useState(0);
  const [clickedShape, setClickedShape] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(40);

  const playStartTime = useRef<number>(0);
  const lastActionTime = useRef<number>(0);
  const timerInterval = useRef<any>(null);
  const metrics = useRef<FollowStepsData>({
    activity_id: 1,
    first_action_delay_ms: null,
    step_delays_ms: [],
    sequence_errors: 0,
    wrong_key_count: 0,
    extra_click_count: 0,
    completion_rate: 0,
    total_time_ms: 0,
  });

  const beginActivity = () => {
    setPhase('instructions');
    setCompletedSteps(0);
    setClickedShape(null);
    setTimeLeft(40);

    setTimeout(() => {
      setPhase('playing');
      playStartTime.current = Date.now();
      lastActionTime.current = Date.now();
    }, SHOW_DURATION_MS);
  };

  useEffect(() => {
    if (phase === 'playing') {
      timerInterval.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerInterval.current) clearInterval(timerInterval.current);
            setPhase('timeout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [phase]);

  const endActivity = useCallback((stepsCompleted: number) => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    const now = Date.now();
    metrics.current.completion_rate = Math.round((stepsCompleted / ACTIVITY.length) * 100);
    metrics.current.total_time_ms = now - playStartTime.current;

    setPhase('done');
  }, []);

  const handleProceed = () => {
    if (onComplete) onComplete(metrics.current);
  };

  useEffect(() => {
    if (phase === 'playing' && completedSteps === ACTIVITY.length) {
      endActivity(completedSteps);
    }
  }, [completedSteps, phase, endActivity]);

  const handleAction = useCallback((type: StepType, value: string) => {
    if (phase !== 'playing') return;
    const now = Date.now();

    if (metrics.current.first_action_delay_ms === null) {
      metrics.current.first_action_delay_ms = now - playStartTime.current;
    } else {
      metrics.current.step_delays_ms.push(now - lastActionTime.current);
    }
    lastActionTime.current = now;

    if (type === 'CLICK') {
      setClickedShape(value);
      setTimeout(() => setClickedShape(null), 350);
    }

    if (completedSteps >= ACTIVITY.length) return;

    const target = ACTIVITY[completedSteps];
    const correct = target.type === type && target.expectedValue.toLowerCase() === value.toLowerCase();

    if (correct) {
      setCompletedSteps(prev => prev + 1);
    } else {
      if (type === 'CLICK') {
        metrics.current.extra_click_count += 1;
      } else {
        metrics.current.wrong_key_count += 1;
      }
      metrics.current.sequence_errors += 1;
    }
  }, [phase, completedSteps]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (phase === 'playing') {
        handleAction('KEYPRESS', e.key);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleAction, phase]);

  const shapeGlow = (id: string) =>
    clickedShape === id
      ? '0 0 0 6px rgba(77,166,255,0.25), 0 4px 18px rgba(77,166,255,0.3)'
      : '0 2px 10px rgba(0,0,0,0.06)';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        
        {phase === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center w-full max-w-xl bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
          >
            <h2 className="text-xl font-black tracking-wider text-slate-800 mb-1 uppercase">Mission Control</h2>
            <p className="text-base font-bold text-slate-500 mb-5">Follow the path →</p>

            <div className="flex flex-col gap-3 text-lg font-bold text-slate-700 mb-6 w-full max-w-sm">
              <div className="grid grid-cols-[3rem_2rem_2rem_1fr] items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-2xl text-center">🔵</span>
                <span className="text-blue-500 text-xl font-black text-center">1</span>
                <span className="text-slate-400 text-lg text-center">→</span>
                <span className="text-lg tracking-widest uppercase text-left pl-2">CLICK</span>
              </div>
              <div className="grid grid-cols-[3rem_2rem_2rem_1fr] items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-2xl text-center font-black">←</span>
                <span className="text-blue-500 text-xl font-black text-center">2</span>
                <span className="text-slate-400 text-lg text-center">→</span>
                <span className="text-lg tracking-widest uppercase text-left pl-2">PRESS</span>
              </div>
              <div className="grid grid-cols-[3rem_2rem_2rem_1fr] items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-2xl text-center font-black">A</span>
                <span className="text-blue-500 text-xl font-black text-center">3</span>
                <span className="text-slate-400 text-lg text-center">→</span>
                <span className="text-lg tracking-widest uppercase text-left pl-2">TYPE A</span>
              </div>
            </div>

            <div className="bg-slate-100 rounded-2xl py-4 px-8 mb-6 flex items-center justify-center gap-4 text-3xl shadow-inner w-full max-w-sm">
              <span className="w-10 text-center">🔵</span>
              <span className="text-slate-300 text-2xl">→</span>
              <span className="font-black text-slate-700 w-10 text-center">←</span>
              <span className="text-slate-300 text-2xl">→</span>
              <span className="font-black text-slate-800 w-10 text-center">A</span>
            </div>

            <p className="text-lg font-bold text-slate-700 mb-6">Do these 3 steps in order.</p>

            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md text-xs flex items-center gap-3 border border-blue-500 mb-2">
                <span className="font-bold tracking-wide">Ready? Click Start.</span>
              </div>
              <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-500 mb-2 drop-shadow-md">
                <ArrowDown size={24} strokeWidth={3} />
              </motion.div>
              <button
                onClick={beginActivity}
                className="bg-blue-500 hover:bg-blue-600 text-white text-lg font-black tracking-widest py-3 px-10 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                START
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'instructions' && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center w-full max-w-sm"
          >
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex flex-col items-center bg-white p-4 rounded-3xl shadow-md border-2 border-slate-100 w-full">
                <div className="text-blue-500 font-black text-xl mb-1">①</div>
                <div className="text-5xl mb-2">🔵</div>
                <div className="text-2xl font-black text-slate-800 tracking-widest">CLICK</div>
              </div>
              
              <div className="text-slate-300 text-3xl font-black">↓</div>
              
              <div className="flex flex-col items-center bg-white p-4 rounded-3xl shadow-md border-2 border-slate-100 w-full">
                <div className="text-blue-500 font-black text-xl mb-1">②</div>
                <div className="text-5xl font-black text-slate-700 mb-2">←</div>
                <div className="text-2xl font-black text-slate-800 tracking-widest">PRESS</div>
              </div>
              
              <div className="text-slate-300 text-3xl font-black">↓</div>
              
              <div className="flex flex-col items-center bg-white p-4 rounded-3xl shadow-md border-2 border-slate-100 w-full">
                <div className="text-blue-500 font-black text-xl mb-1">③</div>
                <div className="text-5xl font-black text-slate-800 mb-2">A</div>
                <div className="text-2xl font-black text-slate-800 tracking-widest">TYPE</div>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center w-full max-w-lg bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
          >
            {/* Visual Sequence Feedback */}
            <div className="bg-slate-100 rounded-3xl py-4 px-8 mb-8 flex items-center justify-center gap-6 text-4xl shadow-inner w-full">
              <div className="relative">
                <span className={completedSteps > 0 ? "opacity-30" : "opacity-100"}>🔵</span>
                {completedSteps > 0 && <span className="absolute -bottom-1 -right-2 text-green-500 text-2xl font-black bg-white rounded-full p-1 shadow-sm border border-green-100">✓</span>}
              </div>
              
              <span className="text-slate-300 text-3xl mx-1">→</span>
              
              <div className="relative">
                <span className={`font-black text-slate-700 ${completedSteps > 1 ? "opacity-30" : "opacity-100"}`}>←</span>
                {completedSteps > 1 && <span className="absolute -bottom-1 -right-2 text-green-500 text-2xl font-black bg-white rounded-full p-1 shadow-sm border border-green-100">✓</span>}
              </div>

              <span className="text-slate-300 text-3xl mx-1">→</span>
              
              <div className="relative">
                <span className={`font-black text-slate-800 ${completedSteps > 2 ? "opacity-30" : "opacity-100"}`}>A</span>
                {completedSteps > 2 && <span className="absolute -bottom-1 -right-2 text-green-500 text-2xl font-black bg-white rounded-full p-1 shadow-sm border border-green-100">✓</span>}
              </div>
            </div>

            {/* Shape canvas */}
            <div className="w-full flex items-center justify-center gap-8 py-10 bg-slate-50 rounded-3xl border-2 border-slate-100 shadow-sm">
              <button
                onClick={() => handleAction('CLICK', 'blue-circle')}
                className="w-24 h-24 rounded-full outline-none flex-shrink-0 transition-transform active:scale-90"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #7EC8FF, #4DA6FF)',
                  boxShadow: shapeGlow('blue-circle')
                }}
              />
              
              <button
                onClick={() => handleAction('CLICK', 'green-square')}
                className="w-20 h-20 rounded-2xl outline-none flex-shrink-0 transition-transform active:scale-90"
                style={{
                  background: 'linear-gradient(135deg, #85EAA6, #50C878)',
                  boxShadow: shapeGlow('green-square')
                }}
              />
              
              <button
                onClick={() => handleAction('CLICK', 'orange-triangle')}
                className="w-24 h-24 outline-none flex-shrink-0 transition-transform active:scale-90"
                style={{
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  background: 'linear-gradient(160deg, #FFD580, #FFB347)',
                  boxShadow: clickedShape === 'orange-triangle' ? '0 0 0 6px rgba(255,179,71,0.2)' : 'none'
                }}
              />
            </div>
            
            <div className="mt-6 text-lg font-bold text-slate-400 flex items-center gap-2">
              <span className="text-xl">⏱️</span> {timeLeft}s left
            </div>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-4 bg-white p-10 rounded-3xl shadow-sm border border-slate-100"
          >
            <div className="text-6xl mb-2 text-green-500 bg-green-50 rounded-full p-6 shadow-sm border border-green-100">
              ✓
            </div>
            <h2 className="text-3xl font-black text-slate-800">Done!</h2>
            <p className="text-xl font-bold text-slate-500 mb-6">
              Great job following the sequence.
            </p>
            
            <div className="flex items-center">
              <div className="bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-md text-sm font-bold border border-emerald-500 mr-4">
                Click Next
              </div>
              <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-emerald-500 mr-4">
                <ArrowRight size={28} strokeWidth={3} />
              </motion.div>
              <button
                onClick={handleProceed}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-black tracking-widest py-3 px-10 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                NEXT
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'timeout' && (
          <motion.div
            key="timeout"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center gap-4 bg-white p-10 rounded-3xl shadow-sm border border-slate-100"
          >
            <div className="text-6xl mb-2">
              ⏰
            </div>
            <h2 className="text-3xl font-black text-slate-800">Time's up!</h2>
            <p className="text-lg font-bold text-slate-500 mb-6">
              You did a great job following along.
            </p>
            
            <div className="flex items-center">
              <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-500 mr-4">
                <ArrowRight size={28} strokeWidth={3} />
              </motion.div>
              <button
                onClick={handleProceed}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-black tracking-widest py-3 px-10 rounded-full shadow-lg transition-transform hover:scale-105"
              >
                NEXT
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
