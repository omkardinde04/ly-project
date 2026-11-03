import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RotateCcw, Undo2 } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { useSpeechCapture, micStatusText } from './useSpeechCapture';
import { MicButton, LevelBars, TimeBar, MicErrorBox } from './MicControls';
import { lettersFromSpeech } from './speechLetters';

interface AlphabetScenario {
  id: string;
  title: string;
  prompt: string;
  /** Train carriages: a letter, or null for an empty "?" carriage */
  cars: (string | null)[];
  expected: string[];
  backwards?: boolean;
}

export interface VoiceAlphabetMetrics {
  scenario_id: string;
  transcript: string;
  letters?: string[];
  expected?: string[];
  matched?: number;
  time_taken_ms: number;
}

interface VoiceAlphabetTaskProps {
  onComplete: (metrics: VoiceAlphabetMetrics[]) => void;
}

const SCENARIOS: AlphabetScenario[] = [
  {
    id: 'continue',
    title: 'What comes next?',
    prompt: 'Say the next 3 letters.',
    cars: ['C', 'D', 'E', null, null, null],
    expected: ['f', 'g', 'h'],
  },
  {
    id: 'start_mid',
    title: 'Start at M',
    prompt: 'Say M and the next 3 letters.',
    cars: ['M', null, null, null],
    expected: ['m', 'n', 'o', 'p'],
  },
  {
    id: 'missing',
    title: 'Find the missing ones',
    prompt: 'Say the 2 missing letters.',
    cars: ['A', 'B', null, null, 'E'],
    expected: ['c', 'd'],
  },
  {
    id: 'reverse',
    title: 'Backwards train',
    prompt: 'Say these letters backwards.',
    cars: ['H', 'I', 'J'],
    expected: ['j', 'i', 'h'],
    backwards: true,
  },
];

const MAX_MS = 12000;

/** Count expected letters heard in the right order (for the report). */
function matchedInOrder(heard: string[], expected: string[]): number {
  let j = 0;
  for (const letter of heard) if (j < expected.length && letter === expected[j]) j++;
  return j;
}

/** Small engine drawn facing right; mirrored when the train goes left. */
function Engine({ facing }: { facing: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 64 52"
      className="w-14 h-12 sm:w-16 sm:h-14 shrink-0"
      style={{ transform: facing === 'left' ? 'scaleX(-1)' : undefined }}
      aria-hidden
    >
      <rect x="4" y="14" width="22" height="26" rx="4" fill="#DC2626" />
      <rect x="8" y="18" width="14" height="10" rx="2" fill="#BFDBFE" />
      <rect x="24" y="22" width="30" height="18" rx="6" fill="#EF4444" />
      <rect x="38" y="10" width="8" height="14" rx="2" fill="#334155" />
      <path d="M54 34 L62 42 L54 42 Z" fill="#334155" />
      <circle cx="14" cy="44" r="6" fill="#334155" />
      <circle cx="34" cy="44" r="5" fill="#334155" />
      <circle cx="48" cy="44" r="5" fill="#334155" />
      <circle cx="42" cy="6" r="3" fill="#CBD5E1" />
    </svg>
  );
}

function Train({ cars, backwards, reduceMotion }: { cars: (string | null)[]; backwards?: boolean; reduceMotion: boolean }) {
  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="mx-auto flex w-max items-end gap-1.5 sm:gap-2">
        {/* Forward: engine at the right, pulling right. Backwards: engine at the left, pulling left.
            The carriages always read left-to-right, so the answer is never shown. */}
        {backwards && <Engine facing="left" />}
        {cars.map((car, i) => (
          <motion.div
            key={i}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex flex-col items-center"
          >
            <div
              className={`w-11 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-black border-2 ${
                car
                  ? 'bg-[#2563EB] border-[#1D4ED8] text-white'
                  : 'bg-amber-50 border-dashed border-amber-400 text-amber-500'
              }`}
              style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}
            >
              {car ?? '?'}
            </div>
            <div className="flex gap-3 -mt-1" aria-hidden>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            </div>
          </motion.div>
        ))}
        {!backwards && <Engine facing="right" />}
      </div>
      <div className="mx-auto mt-0.5 h-1 max-w-md rounded-full bg-slate-300" aria-hidden />
      {backwards && (
        <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-amber-700">
          <Undo2 size={14} /> The train is going the other way
        </p>
      )}
    </div>
  );
}

export function VoiceAlphabetTask({ onComplete }: VoiceAlphabetTaskProps) {
  const { reduceMotion } = useDyslexia();
  const mic = useSpeechCapture({ maxMs: MAX_MS });
  const [round, setRound] = useState(0);
  const [allMetrics, setAllMetrics] = useState<VoiceAlphabetMetrics[]>([]);
  const [done, setDone] = useState(false);

  const scenario = SCENARIOS[round];
  const heard = lettersFromSpeech(mic.transcript);
  const hasResult = mic.status === 'stopped';

  const next = () => {
    const metric: VoiceAlphabetMetrics = {
      scenario_id: scenario.id,
      transcript: mic.transcript,
      letters: heard,
      expected: scenario.expected,
      matched: matchedInOrder(heard, scenario.expected),
      time_taken_ms: mic.elapsedMs,
    };
    const updated = [...allMetrics, metric];
    setAllMetrics(updated);
    mic.reset();
    if (round < SCENARIOS.length - 1) {
      setRound(round + 1);
    } else {
      setDone(true);
      window.setTimeout(() => onComplete(updated), 700);
    }
  };

  const skip = () => {
    mic.reset();
    onComplete(allMetrics);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-5 sm:p-8 border border-blue-100 shadow-sm flex flex-col items-center gap-5">
      {/* Header */}
      <div className="w-full flex items-center justify-between gap-3">
        <div className="text-left">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#2563EB]">Letter train</p>
          <h2 className="font-black text-[#1A202C]" style={{ fontSize: 'clamp(1.15rem, 2.6vw, 1.5rem)' }}>
            {done ? 'All aboard!' : scenario.title}
          </h2>
        </div>
        <div className="flex items-center gap-1.5" aria-label={`Round ${round + 1} of ${SCENARIOS.length}`}>
          {SCENARIOS.map((s, i) => (
            <span
              key={s.id}
              className={`h-2 rounded-full transition-all ${
                i < round || done ? 'w-2 bg-emerald-400' : i === round ? 'w-7 bg-[#2563EB]' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-10 flex flex-col items-center gap-2 text-center"
          >
            <span className="text-5xl" aria-hidden>
              🎉
            </span>
            <p className="text-lg font-black text-[#1A202C]">Great job! On to the next one…</p>
          </motion.div>
        ) : (
          <motion.div
            key={scenario.id}
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
            className="w-full flex flex-col items-center gap-5"
          >
            <div className="w-full rounded-2xl bg-gradient-to-b from-sky-50 to-white border border-sky-100 px-3 py-5">
              <Train cars={scenario.cars} backwards={scenario.backwards} reduceMotion={reduceMotion} />
            </div>

            <p className="font-bold text-[#1A202C] text-center" style={{ fontSize: 'clamp(1rem, 2.2vw, 1.2rem)' }}>
              {scenario.prompt}
            </p>

            {mic.error ? (
              <MicErrorBox error={mic.error} onRetry={mic.start} onSkip={skip} />
            ) : hasResult ? null : (
              <div className="flex flex-col items-center gap-3">
                <MicButton status={mic.status} level={mic.level} onStart={mic.start} onStop={mic.stop} reduceMotion={reduceMotion} />
                <LevelBars level={mic.level} active={mic.status === 'listening'} />
                <p className="text-sm font-semibold text-slate-600 text-center" aria-live="polite">
                  {micStatusText(mic.status, mic.heardSound, mic.supported)}
                </p>
                {mic.status === 'listening' && <TimeBar elapsedMs={mic.elapsedMs} maxMs={mic.maxMs} />}
              </div>
            )}

            {/* What we heard */}
            {(mic.status === 'listening' || hasResult) && (
              <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center" aria-live="polite">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">We heard</p>
                {heard.length ? (
                  <div className="flex flex-wrap justify-center gap-2">
                    {heard.map((l, i) => (
                      <motion.span
                        key={`${l}-${i}`}
                        initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-10 h-10 rounded-xl bg-white border-2 border-[#2563EB] text-[#2563EB] font-black text-xl flex items-center justify-center"
                      >
                        {l.toUpperCase()}
                      </motion.span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-500">
                    {mic.transcript
                      ? `"${mic.transcript}"`
                      : hasResult
                        ? mic.heardSound
                          ? 'We heard you, but could not make out letters.'
                          : 'We did not hear anything. Try again?'
                        : '…'}
                  </p>
                )}
              </div>
            )}

            {hasResult && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={mic.start}
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#1A202C] text-sm font-bold cursor-pointer"
                >
                  <RotateCcw size={16} /> Try again
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-1.5 px-7 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-extrabold shadow-sm cursor-pointer"
                >
                  {round < SCENARIOS.length - 1 ? 'Next train' : 'Finish'} <ArrowRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!done && !mic.error && (
        <button type="button" onClick={skip} className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline cursor-pointer">
          My mic isn’t working — skip this question
        </button>
      )}
    </div>
  );
}
