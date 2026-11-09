import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, ArrowRight, Check, X } from 'lucide-react';

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
  isCorrect?: boolean;
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
  const [stepResults, setStepResults] = useState<(boolean | null)[]>([null, null, null]);
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(40);
  const isTransitioningRef = useRef(false);

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
    isCorrect: true,
  });

  const beginActivity = () => {
    setPhase('instructions');
    setCompletedSteps(0);
    setStepResults([null, null, null]);
    setClickedItem(null);
    setTimeLeft(40);
    isTransitioningRef.current = false;

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

  const endActivity = useCallback((results: (boolean | null)[]) => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    const now = Date.now();
    const correctCount = results.filter(r => r === true).length;
    metrics.current.completion_rate = Math.round((correctCount / ACTIVITY.length) * 100);
    metrics.current.total_time_ms = now - playStartTime.current;
    metrics.current.isCorrect = metrics.current.sequence_errors === 0 && correctCount === ACTIVITY.length;

    setPhase('done');
  }, []);

  const handleProceed = () => {
    if (onComplete) onComplete(metrics.current);
  };

  const handleAction = useCallback((type: StepType, value: string) => {
    if (phase !== 'playing' || isTransitioningRef.current) return;
    if (completedSteps >= ACTIVITY.length) return;

    isTransitioningRef.current = true;
    const now = Date.now();

    if (metrics.current.first_action_delay_ms === null) {
      metrics.current.first_action_delay_ms = now - playStartTime.current;
    } else {
      metrics.current.step_delays_ms.push(now - lastActionTime.current);
    }
    lastActionTime.current = now;

    setClickedItem(value);

    const currentStepIdx = completedSteps;
    const target = ACTIVITY[currentStepIdx];

    // Determine correctness for the current step
    let isStepCorrect = false;
    if (currentStepIdx === 0) {
      // Step 1: Shape click
      isStepCorrect = type === 'CLICK' && value === 'blue-circle';
      if (!isStepCorrect) {
        metrics.current.extra_click_count += 1;
        metrics.current.sequence_errors += 1;
      }
    } else if (currentStepIdx === 1) {
      // Step 2: Directional arrow
      const valLower = value.toLowerCase();
      isStepCorrect = valLower === 'arrowleft' || valLower === 'left' || valLower === '←';
      if (!isStepCorrect) {
        metrics.current.wrong_key_count += 1;
        metrics.current.sequence_errors += 1;
      }
    } else if (currentStepIdx === 2) {
      // Step 3: Letter typing
      isStepCorrect = value.toLowerCase() === 'a';
      if (!isStepCorrect) {
        metrics.current.wrong_key_count += 1;
        metrics.current.sequence_errors += 1;
      }
    }

    // Update step results array
    const updatedResults = [...stepResults];
    updatedResults[currentStepIdx] = isStepCorrect;
    setStepResults(updatedResults);

    // Brief delay to let student see feedback, then advance to next step or complete
    setTimeout(() => {
      setClickedItem(null);
      const nextStep = currentStepIdx + 1;
      setCompletedSteps(nextStep);
      isTransitioningRef.current = false;

      if (nextStep >= ACTIVITY.length) {
        endActivity(updatedResults);
      }
    }, 280);
  }, [phase, completedSteps, stepResults, endActivity]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (phase !== 'playing' || isTransitioningRef.current) return;

      if (completedSteps === 1) {
        // Step 2 responds to arrow keys
        handleAction('KEYPRESS', e.key);
      } else if (completedSteps === 2) {
        // Step 3 responds to letter keys
        if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
          handleAction('KEYPRESS', e.key);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleAction, phase, completedSteps]);

  const shapeGlow = (id: string) =>
    clickedItem === id
      ? '0 0 0 6px rgba(77,166,255,0.3), 0 4px 18px rgba(77,166,255,0.4)'
      : '0 2px 10px rgba(0,0,0,0.06)';

  const correctCount = stepResults.filter(r => r === true).length;

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
              <button
                type="button"
                onClick={beginActivity}
                className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white px-4 py-2 rounded-xl shadow-md text-xs flex items-center gap-3 border border-blue-500 mb-2 cursor-pointer transition-all"
              >
                <span className="font-bold tracking-wide">Ready? Click Start.</span>
              </button>
              <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-500 mb-2 drop-shadow-md">
                <ArrowDown size={24} strokeWidth={3} />
              </motion.div>
              <button
                type="button"
                onClick={beginActivity}
                className="bg-blue-500 hover:bg-blue-600 text-white text-lg font-black tracking-widest py-3 px-10 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
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
            {/* Visual Sequence Feedback Header */}
            <div className="bg-slate-100 rounded-3xl py-4 px-8 mb-6 flex items-center justify-center gap-6 text-4xl shadow-inner w-full">
              {/* Step 1: Circle */}
              <div className="relative flex flex-col items-center">
                <span className={`transition-opacity ${completedSteps > 0 ? "opacity-35" : "opacity-100 font-bold scale-110"}`}>
                  🔵
                </span>
                {stepResults[0] === true && (
                  <span className="absolute -bottom-2 -right-2 text-emerald-600 bg-white rounded-full p-1 shadow-sm border border-emerald-200">
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}
                {stepResults[0] === false && (
                  <span className="absolute -bottom-2 -right-2 text-rose-600 bg-white rounded-full p-1 shadow-sm border border-rose-200">
                    <X size={16} strokeWidth={3} />
                  </span>
                )}
              </div>
              
              <span className="text-slate-300 text-3xl mx-1">→</span>
              
              {/* Step 2: Left Arrow */}
              <div className="relative flex flex-col items-center">
                <span className={`font-black text-slate-700 transition-opacity ${completedSteps > 1 ? "opacity-35" : completedSteps === 1 ? "opacity-100 scale-110 text-blue-600" : "opacity-60"}`}>
                  ←
                </span>
                {stepResults[1] === true && (
                  <span className="absolute -bottom-2 -right-2 text-emerald-600 bg-white rounded-full p-1 shadow-sm border border-emerald-200">
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}
                {stepResults[1] === false && (
                  <span className="absolute -bottom-2 -right-2 text-rose-600 bg-white rounded-full p-1 shadow-sm border border-rose-200">
                    <X size={16} strokeWidth={3} />
                  </span>
                )}
              </div>

              <span className="text-slate-300 text-3xl mx-1">→</span>
              
              {/* Step 3: Letter A */}
              <div className="relative flex flex-col items-center">
                <span className={`font-black text-slate-800 transition-opacity ${completedSteps > 2 ? "opacity-35" : completedSteps === 2 ? "opacity-100 scale-110 text-blue-600" : "opacity-60"}`}>
                  A
                </span>
                {stepResults[2] === true && (
                  <span className="absolute -bottom-2 -right-2 text-emerald-600 bg-white rounded-full p-1 shadow-sm border border-emerald-200">
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}
                {stepResults[2] === false && (
                  <span className="absolute -bottom-2 -right-2 text-rose-600 bg-white rounded-full p-1 shadow-sm border border-rose-200">
                    <X size={16} strokeWidth={3} />
                  </span>
                )}
              </div>
            </div>

            {/* Step prompt */}
            <div className="text-center mb-5">
              <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Step {Math.min(completedSteps + 1, 3)} of 3
              </span>
              <h3 className="text-lg font-black text-slate-800 mt-2">
                {completedSteps === 0 && 'Step 1: Choose the shape you memorized'}
                {completedSteps === 1 && 'Step 2: Choose the direction you memorized'}
                {completedSteps === 2 && 'Step 3: Choose or type the letter you memorized'}
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5">
                {completedSteps === 0 && 'Click one of the shapes below'}
                {completedSteps === 1 && 'Click an arrow or press arrow keys on your keyboard'}
                {completedSteps === 2 && 'Click a letter or type on your keyboard'}
              </p>
            </div>

            {/* Interactive Options Canvas */}
            <div className="w-full flex items-center justify-center p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 shadow-sm min-h-[160px]">
              {completedSteps === 0 && (
                <div className="flex items-center justify-center gap-6 sm:gap-8">
                  {/* Option 1: Blue Circle (Correct) */}
                  <button
                    type="button"
                    onClick={() => handleAction('CLICK', 'blue-circle')}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full outline-none flex-shrink-0 transition-all hover:scale-105 active:scale-90 cursor-pointer"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, #7EC8FF, #4DA6FF)',
                      boxShadow: shapeGlow('blue-circle')
                    }}
                    title="Blue Circle"
                  />
                  
                  {/* Option 2: Green Square (Wrong) */}
                  <button
                    type="button"
                    onClick={() => handleAction('CLICK', 'green-square')}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl outline-none flex-shrink-0 transition-all hover:scale-105 active:scale-90 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #85EAA6, #50C878)',
                      boxShadow: shapeGlow('green-square')
                    }}
                    title="Green Square"
                  />
                  
                  {/* Option 3: Orange Triangle (Wrong) */}
                  <button
                    type="button"
                    onClick={() => handleAction('CLICK', 'orange-triangle')}
                    className="w-20 h-20 sm:w-24 sm:h-24 outline-none flex-shrink-0 transition-all hover:scale-105 active:scale-90 cursor-pointer"
                    style={{
                      clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                      background: 'linear-gradient(160deg, #FFD580, #FFB347)',
                      boxShadow: clickedItem === 'orange-triangle' ? '0 0 0 6px rgba(255,179,71,0.2)' : 'none'
                    }}
                    title="Orange Triangle"
                  />
                </div>
              )}

              {completedSteps === 1 && (
                <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-sm">
                  {/* Option 1: Left Arrow (Correct) */}
                  <button
                    type="button"
                    onClick={() => handleAction('KEYPRESS', 'ArrowLeft')}
                    className={`py-4 px-3 rounded-2xl text-2xl font-black border-2 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 ${
                      clickedItem === 'ArrowLeft'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-95'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                    }`}
                  >
                    <span>←</span>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-1">Left</span>
                  </button>

                  {/* Option 2: Up Arrow (Wrong) */}
                  <button
                    type="button"
                    onClick={() => handleAction('KEYPRESS', 'ArrowUp')}
                    className={`py-4 px-3 rounded-2xl text-2xl font-black border-2 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 ${
                      clickedItem === 'ArrowUp'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-95'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span>↑</span>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-1">Up</span>
                  </button>

                  {/* Option 3: Right Arrow (Wrong) */}
                  <button
                    type="button"
                    onClick={() => handleAction('KEYPRESS', 'ArrowRight')}
                    className={`py-4 px-3 rounded-2xl text-2xl font-black border-2 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 ${
                      clickedItem === 'ArrowRight'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-95'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span>→</span>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-1">Right</span>
                  </button>

                  {/* Option 4: Down Arrow (Wrong) */}
                  <button
                    type="button"
                    onClick={() => handleAction('KEYPRESS', 'ArrowDown')}
                    className={`py-4 px-3 rounded-2xl text-2xl font-black border-2 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 ${
                      clickedItem === 'ArrowDown'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-95'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span>↓</span>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-1">Down</span>
                  </button>
                </div>
              )}

              {completedSteps === 2 && (
                <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-sm">
                  {/* Option A (Correct) */}
                  <button
                    type="button"
                    onClick={() => handleAction('KEYPRESS', 'a')}
                    className={`py-4 px-3 rounded-2xl text-3xl font-black border-2 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 ${
                      clickedItem?.toLowerCase() === 'a'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-95'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                    }`}
                  >
                    <span>A</span>
                  </button>

                  {/* Option B (Wrong) */}
                  <button
                    type="button"
                    onClick={() => handleAction('KEYPRESS', 'b')}
                    className={`py-4 px-3 rounded-2xl text-3xl font-black border-2 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 ${
                      clickedItem?.toLowerCase() === 'b'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-95'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span>B</span>
                  </button>

                  {/* Option C (Wrong) */}
                  <button
                    type="button"
                    onClick={() => handleAction('KEYPRESS', 'c')}
                    className={`py-4 px-3 rounded-2xl text-3xl font-black border-2 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 ${
                      clickedItem?.toLowerCase() === 'c'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-95'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span>C</span>
                  </button>

                  {/* Option D (Wrong) */}
                  <button
                    type="button"
                    onClick={() => handleAction('KEYPRESS', 'd')}
                    className={`py-4 px-3 rounded-2xl text-3xl font-black border-2 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 ${
                      clickedItem?.toLowerCase() === 'd'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-95'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span>D</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-5 text-sm font-bold text-slate-400 flex items-center gap-2">
              <span className="text-base">⏱️</span> {timeLeft}s remaining
            </div>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-4 bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full"
          >
            <div className={`text-5xl p-5 rounded-full shadow-sm border ${
              correctCount === 3
                ? 'text-emerald-500 bg-emerald-50 border-emerald-100'
                : 'text-blue-500 bg-blue-50 border-blue-100'
            }`}>
              {correctCount === 3 ? <Check size={48} strokeWidth={3} /> : '🎯'}
            </div>
            
            <h2 className="text-2xl font-black text-slate-800">
              {correctCount === 3 ? 'Done!' : 'Mission Completed!'}
            </h2>
            <p className="text-base font-bold text-slate-500 mb-2">
              {correctCount === 3
                ? 'Great job following the complete sequence.'
                : `You finished the sequence (${correctCount} of 3 correct).`}
            </p>

            {/* Sequence Summary Badges */}
            <div className="flex items-center justify-center gap-3 bg-slate-50 py-3 px-6 rounded-2xl border border-slate-100 mb-4 w-full">
              <div className="flex items-center gap-1.5 text-base font-bold">
                <span>🔵</span>
                {stepResults[0] ? <span className="text-emerald-600 font-black">✓</span> : <span className="text-rose-500 font-black">✗</span>}
              </div>
              <span className="text-slate-300">→</span>
              <div className="flex items-center gap-1.5 text-base font-bold">
                <span>←</span>
                {stepResults[1] ? <span className="text-emerald-600 font-black">✓</span> : <span className="text-rose-500 font-black">✗</span>}
              </div>
              <span className="text-slate-300">→</span>
              <div className="flex items-center gap-1.5 text-base font-bold">
                <span>A</span>
                {stepResults[2] ? <span className="text-emerald-600 font-black">✓</span> : <span className="text-rose-500 font-black">✗</span>}
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleProceed}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-4 py-2 rounded-xl shadow-md text-sm font-bold border border-emerald-500 mr-4 cursor-pointer transition-all"
              >
                Click Next
              </button>
              <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-emerald-500 mr-4">
                <ArrowRight size={28} strokeWidth={3} />
              </motion.div>
              <button
                type="button"
                onClick={handleProceed}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-black tracking-widest py-3 px-10 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
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
            className="flex flex-col items-center text-center gap-4 bg-white p-10 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full"
          >
            <div className="text-5xl mb-1">
              ⏰
            </div>
            <h2 className="text-2xl font-black text-slate-800">Time's up!</h2>
            <p className="text-base font-bold text-slate-500 mb-6">
              You did a great job following along.
            </p>
            
            <div className="flex items-center">
              <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-500 mr-4">
                <ArrowRight size={28} strokeWidth={3} />
              </motion.div>
              <button
                type="button"
                onClick={handleProceed}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-black tracking-widest py-3 px-10 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
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