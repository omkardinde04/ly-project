import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw, BookOpen, Timer, CheckCircle2 } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { useSpeechCapture, micStatusText } from './useSpeechCapture';
import { MicButton, LevelBars, TimeBar, MicErrorBox } from './MicControls';

interface ParagraphScenario {
  id: string;
  text: string;
  highlights: string[];
}

export interface ReadAloudMetrics {
  paragraph_id: string;
  transcript: string;
  time_to_start_ms: number;
  total_time_ms: number;
  words_read?: number;
  words_total?: number;
}

interface ReadAloudTaskProps {
  onComplete: (metrics: ReadAloudMetrics) => void;
}

const PARAGRAPHS: ParagraphScenario[] = [
  {
    id: 'p1',
    text: 'Today I planned to finish my work early, but I kept procrastinating. I tried to stay focused, and finally completed the assignment before evening.',
    highlights: ['procrastinating', 'focused', 'assignment'],
  },
  {
    id: 'p2',
    text: 'The environment looked calm after the rain. Everyone walked carefully to avoid the slippery path. It was a peaceful afternoon.',
    highlights: ['environment', 'slippery', 'afternoon'],
  },
  {
    id: 'p3',
    text: 'She showed great confidence while speaking. The teacher appreciated her presentation. Everyone listened with attention.',
    highlights: ['confidence', 'presentation', 'attention'],
  },
  {
    id: 'p4',
    text: 'The celebration started in the evening. Children were excited about the performance. The decorations looked beautiful.',
    highlights: ['celebration', 'performance', 'decorations'],
  },
];

const MAX_MS = 60000;
const clean = (w: string) => w.toLowerCase().replace(/[^a-z']/g, '');

/** Similar enough? (speech engines drop endings, mishear a letter, etc.) */
function sameWord(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 4 && b.length >= 4 && a.slice(0, 4) === b.slice(0, 4)) return true;
  return false;
}

/** How far through the paragraph the reader has got (greedy, forgiving). */
function wordsReadSoFar(paragraph: string[], spoken: string[]): number {
  let p = 0;
  for (const word of spoken) {
    for (let k = p; k < Math.min(paragraph.length, p + 4); k++) {
      if (sameWord(paragraph[k], word)) {
        p = k + 1;
        break;
      }
    }
  }
  return p;
}

export function ReadAloudTask({ onComplete }: ReadAloudTaskProps) {
  const { reduceMotion } = useDyslexia();
  const [paragraph] = useState<ParagraphScenario>(() => PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)]);
  const mic = useSpeechCapture({ maxMs: MAX_MS });
  const [finished, setFinished] = useState(false);
  const mountedAt = useRef(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const words = useMemo(() => paragraph.text.split(' '), [paragraph]);
  const cleanWords = useMemo(() => words.map(clean), [words]);
  const spoken = useMemo(() => mic.transcript.split(/\s+/).map(clean).filter(Boolean), [mic.transcript]);
  const readCount = wordsReadSoFar(cleanWords, spoken);
  const hasResult = mic.status === 'stopped';
  const pct = Math.round((readCount / words.length) * 100);

  // Reached the last word: stop listening by itself
  const { status, stop } = mic;
  useEffect(() => {
    if (status !== 'listening' || readCount < words.length) return;
    const t = window.setTimeout(stop, 1200);
    return () => window.clearTimeout(t);
  }, [status, stop, readCount, words.length]);

  const finish = (skipped = false) => {
    setFinished(true);
    const firstWord = mic.timeToFirstWord();
    const metrics: ReadAloudMetrics = {
      paragraph_id: paragraph.id,
      transcript: skipped ? 'Skipped' : mic.transcript,
      time_to_start_ms: firstWord ?? 0,
      total_time_ms: skipped ? 0 : Date.now() - mountedAt.current,
      words_read: skipped ? 0 : readCount,
      words_total: words.length,
    };
    mic.reset();
    window.setTimeout(() => onComplete(metrics), skipped ? 0 : 800);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl p-5 sm:p-8 border border-blue-100 shadow-sm flex flex-col items-center gap-5">
      {/* Header */}
      <div className="w-full flex items-center justify-between gap-3">
        <div className="text-left">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#2563EB]">Story time</p>
          <h2 className="font-black text-[#1A202C]" style={{ fontSize: 'clamp(1.15rem, 2.6vw, 1.5rem)' }}>
            Read this out loud
          </h2>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center" aria-hidden>
          <BookOpen size={20} />
        </div>
      </div>

      {/* Paragraph */}
      <div className="w-full rounded-2xl bg-[#FFFBEB]/60 border border-amber-100 p-5 sm:p-7">
        <p className="text-left text-[#1E293B]" style={{ fontSize: 'clamp(1.2rem, 2.6vw, 1.6rem)', lineHeight: 2 }}>
          {words.map((word, i) => {
            const tricky = paragraph.highlights.includes(cleanWords[i]);
            const read = i < readCount;
            const isNext = mic.status === 'listening' && i === readCount;
            return (
              <span key={i}>
                <span
                  className={`rounded-lg px-1 py-0.5 transition-colors duration-200 ${
                    read
                      ? 'bg-emerald-100 text-emerald-900'
                      : isNext
                        ? 'bg-blue-100 ring-2 ring-blue-300'
                        : tricky
                          ? 'font-bold underline decoration-amber-400 decoration-[3px] underline-offset-4'
                          : ''
                  }`}
                >
                  {word}
                </span>{' '}
              </span>
            );
          })}
        </p>
        <p className="mt-3 text-xs font-semibold text-amber-800 text-left">Tip: the underlined words are tricky. Take your time.</p>
      </div>

      {/* Progress */}
      {(mic.status === 'listening' || hasResult) && (
        <div className="w-full max-w-md" aria-live="polite">
          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
            <span>Words read</span>
            <span className="tabular-nums">{`${readCount} of ${words.length}`}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              animate={{ width: `${pct}%` }}
              transition={{ duration: reduceMotion ? 0 : 0.3 }}
            />
          </div>
        </div>
      )}

      {finished ? (
        <div className="py-4 text-center" role="status">
          <p className="text-xl font-black text-emerald-600">Excellent reading! ✨</p>
        </div>
      ) : mic.error ? (
        <MicErrorBox error={mic.error} onRetry={mic.start} onSkip={() => finish(true)} />
      ) : hasResult ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold">
              <CheckCircle2 size={16} /> {`${pct}% read`}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm font-bold">
              <Timer size={16} /> {`${Math.round(mic.elapsedMs / 1000)}s`}
            </span>
          </div>
          {!mic.transcript && (
            <p className="text-sm font-medium text-slate-500 text-center max-w-sm">
              {mic.heardSound
                ? 'We heard you, but could not catch the words. You can try again or go on.'
                : 'We did not hear anything. Is the mic on?'}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={mic.start}
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#1A202C] text-sm font-bold cursor-pointer"
            >
              <RotateCcw size={16} /> Read again
            </button>
            <button
              type="button"
              onClick={() => finish(false)}
              className="inline-flex items-center gap-1.5 px-7 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-extrabold shadow-sm cursor-pointer"
            >
              Next <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <MicButton status={mic.status} level={mic.level} onStart={mic.start} onStop={mic.stop} reduceMotion={reduceMotion} />
          <LevelBars level={mic.level} active={mic.status === 'listening'} />
          <p className="text-sm font-semibold text-slate-600 text-center" aria-live="polite">
            {micStatusText(mic.status, mic.heardSound, mic.supported)}
          </p>
          {mic.status === 'listening' && <TimeBar elapsedMs={mic.elapsedMs} maxMs={mic.maxMs} />}
        </div>
      )}

      {!finished && !mic.error && (
        <button
          type="button"
          onClick={() => finish(true)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline cursor-pointer"
        >
          My mic isn’t working — skip this question
        </button>
      )}
    </div>
  );
}
