import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw, BookOpen, Timer, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { useSpeechCapture, micStatusText } from './useSpeechCapture';
import { MicButton, LevelBars, TimeBar } from './MicControls';

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

const cleanWord = (w: string) =>
  w.toLowerCase().replace(/[^a-z0-9']/g, '').trim();

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const v0 = Array(b.length + 1).fill(0);
  const v1 = Array(b.length + 1).fill(0);
  for (let i = 0; i <= b.length; i++) v0[i] = i;
  for (let i = 0; i < a.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= b.length; j++) v0[j] = v1[j];
  }
  return v1[b.length];
}

const HOMOPHONES: Record<string, string[]> = {
  rain: ['reign', 'rein'],
  peaceful: ['pieceful'],
  afternoon: ['after', 'noon'],
  walked: ['walk', 'walks', 'walking'],
  looked: ['look', 'looks', 'looking'],
  to: ['too', 'two'],
  the: ['da', 'de', 'tha', 'a'],
  calm: ['come', 'calmed', 'com', 'call'],
  weather: ['whether'],
  their: ['there', "they're"],
  for: ['four', 'fore'],
  by: ['buy', 'bye'],
  be: ['bee'],
  one: ['won'],
  sea: ['see'],
  hear: ['here'],
  road: ['rode', 'rowed'],
  allowed: ['aloud'],
  son: ['sun'],
  avoid: ['avoided', 'avoids'],
  slippery: ['slippy', 'slip', 'slipped'],
  everyone: ['every', 'one'],
  environment: ['enviroment', 'invironment', 'environments'],
  procrastinating: ['procrastinate', 'procrastinated', 'procrastination'],
  focused: ['focus', 'focussed'],
  assignment: ['assignments'],
  confidence: ['confident', 'confidance'],
  presentation: ['present', 'presentations'],
  attention: ['attentive'],
  celebration: ['celebrate', 'celebrations'],
  performance: ['perform', 'performances'],
  decorations: ['decoration', 'decorated'],
};

function wordsMatch(target: string, spoken: string): boolean {
  if (!target || !spoken) return false;
  if (target === spoken) return true;

  const t = target.replace(/['’]/g, '');
  const s = spoken.replace(/['’]/g, '');
  if (t === s) return true;

  // Check homophones dictionary
  if (HOMOPHONES[t]?.includes(s) || HOMOPHONES[s]?.includes(t)) return true;

  // Suffix stemming (-ed, -ing, -es, -s, -ly, -er, -est, -tion)
  const stemRegex = /(ed|ing|es|s|ly|er|est|tion)$/;
  const tStem = t.replace(stemRegex, '');
  const sStem = s.replace(stemRegex, '');
  if (tStem && sStem && (tStem === sStem || tStem === s || sStem === t)) return true;

  // Prefix root match for longer words
  if (t.length >= 5 && s.length >= 4) {
    if (t.slice(0, 4) === s.slice(0, 4)) return true;
  }

  // Levenshtein edit distance check (for speech-to-text acoustic variations)
  const dist = levenshtein(t, s);
  if (t.length >= 8 && dist <= 3) return true;
  if (t.length >= 5 && dist <= 2) return true;
  if (t.length >= 3 && dist <= 1) return true;

  return false;
}

function alignReadWords(targetWords: string[], spokenWords: string[]): {
  isWordRead: boolean[];
  readCount: number;
  nextWordIndex: number;
} {
  const isWordRead = Array(targetWords.length).fill(false);
  if (!spokenWords.length) {
    return { isWordRead, readCount: 0, nextWordIndex: 0 };
  }

  let t = 0;
  let s = 0;

  while (s < spokenWords.length && t < targetWords.length) {
    const target = targetWords[t];
    const spoken = spokenWords[s];

    // 1. Direct single-word match
    if (wordsMatch(target, spoken)) {
      isWordRead[t] = true;
      t++;
      s++;
      continue;
    }

    // 2. Compound word check (e.g. "after" + "noon" -> "afternoon", "every" + "one" -> "everyone")
    if (s + 1 < spokenWords.length) {
      const combined = spoken + spokenWords[s + 1];
      if (wordsMatch(target, combined)) {
        isWordRead[t] = true;
        t++;
        s += 2;
        continue;
      }
    }

    // 3. Generous lookahead in target words (student skipped or misread current word)
    let lookaheadTarget = -1;
    const maxLookahead = Math.min(targetWords.length, t + 8);
    for (let k = t + 1; k < maxLookahead; k++) {
      if (wordsMatch(targetWords[k], spoken)) {
        lookaheadTarget = k;
        break;
      }
    }

    if (lookaheadTarget !== -1) {
      isWordRead[lookaheadTarget] = true;
      t = lookaheadTarget + 1;
      s++;
      continue;
    }

    // 4. Lookahead in spoken: Was this a filler word (e.g. "um", "uh", repetition)?
    if (s + 1 < spokenWords.length && wordsMatch(target, spokenWords[s + 1])) {
      s++;
      continue;
    }

    // 5. If no match in forward target window, advance spoken stream
    s++;
  }

  const readCount = isWordRead.filter(Boolean).length;
  const firstUnread = isWordRead.findIndex((r) => !r);
  const nextWordIndex = firstUnread === -1 ? targetWords.length : firstUnread;

  return { isWordRead, readCount, nextWordIndex };
}

export function ReadAloudTask({ onComplete }: ReadAloudTaskProps) {
  const { reduceMotion } = useDyslexia();
  const [paragraph] = useState<ParagraphScenario>(
    () => PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)],
  );
  const mic = useSpeechCapture({ maxMs: MAX_MS });
  const [finished, setFinished] = useState(false);
  const mountedAt = useRef(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const rawWords = useMemo(() => paragraph.text.trim().split(/\s+/), [paragraph]);
  const cleanWords = useMemo(() => rawWords.map(cleanWord), [rawWords]);
  const spokenWords = useMemo(
    () => mic.transcript.split(/\s+/).map(cleanWord).filter(Boolean),
    [mic.transcript],
  );

  const alignment = useMemo(
    () => alignReadWords(cleanWords, spokenWords),
    [cleanWords, spokenWords],
  );

  const readCount = alignment.readCount;
  const hasResult = mic.status === 'stopped';
  const pct = Math.round((readCount / rawWords.length) * 100);

  // Auto-stop when the reader reaches the end
  const { status, stop } = mic;
  useEffect(() => {
    if (status !== 'listening' || readCount < rawWords.length) return;
    const t = window.setTimeout(stop, 1200);
    return () => window.clearTimeout(t);
  }, [status, stop, readCount, rawWords.length]);

  const finish = (skipped = false) => {
    setFinished(true);
    const firstWord = mic.timeToFirstWord ? mic.timeToFirstWord() : null;
    const metrics: ReadAloudMetrics = {
      paragraph_id: paragraph.id,
      transcript: skipped ? 'Skipped' : mic.transcript || 'Read aloud completed',
      time_to_start_ms: firstWord ?? 0,
      total_time_ms: skipped ? 0 : Date.now() - mountedAt.current,
      words_read: skipped ? 0 : Math.max(readCount, 1),
      words_total: rawWords.length,
    };
    mic.reset();
    window.setTimeout(() => onComplete(metrics), skipped ? 0 : 600);
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

      {/* Paragraph Box */}
      <div className="w-full rounded-2xl bg-[#FFFBEB]/60 border border-amber-100 p-5 sm:p-7">
        <p className="text-left text-[#1E293B]" style={{ fontSize: 'clamp(1.2rem, 2.6vw, 1.6rem)', lineHeight: 2.1 }}>
          {rawWords.map((word, i) => {
            const isTricky = paragraph.highlights.includes(cleanWords[i]);
            const isRead = alignment.isWordRead[i];
            const isNext = mic.status === 'listening' && i === alignment.nextWordIndex;

            return (
              <span key={i} className="inline-block mr-2 my-0.5">
                <span
                  className={`rounded-xl px-2 py-0.5 transition-all duration-200 ${
                    isRead
                      ? 'bg-emerald-100 text-emerald-900 font-semibold shadow-xs'
                      : isNext
                        ? 'bg-blue-100 text-blue-900 font-bold ring-2 ring-blue-400'
                        : isTricky
                          ? 'font-bold underline decoration-amber-400 decoration-[3px] underline-offset-4'
                          : ''
                  }`}
                >
                  {word}
                </span>
              </span>
            );
          })}
        </p>
        <p className="mt-3 text-xs font-semibold text-amber-800 text-left">Tip: the underlined words are tricky. Take your time.</p>
      </div>

      {/* Progress Bar */}
      {(mic.status === 'listening' || hasResult) && (
        <div className="w-full max-w-md" aria-live="polite">
          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
            <span>Words read</span>
            <span className="tabular-nums">{`${readCount} of ${rawWords.length}`}</span>
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

      {/* Resilient Error / Recovery Banner */}
      {mic.error && !finished && (
        <div className="w-full max-w-lg bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-left">
            <AlertCircle size={20} className="text-amber-600 shrink-0" />
            <span>Voice detection paused. You can retry microphone or continue directly.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={mic.start}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Retry Mic
            </button>
            <button
              type="button"
              onClick={() => finish(false)}
              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Finish
            </button>
          </div>
        </div>
      )}

      {/* States: Finished / Has Result / Listening */}
      {finished ? (
        <div className="py-4 text-center" role="status">
          <p className="text-xl font-black text-emerald-600">Excellent reading! ✨</p>
        </div>
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
                ? 'We heard you, but could not catch every word. You can try again or proceed.'
                : 'We did not hear anything. Is the mic on?'}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={mic.start}
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#1A202C] text-sm font-bold cursor-pointer transition-all active:scale-95"
            >
              <RotateCcw size={16} /> Read again
            </button>
            <button
              type="button"
              onClick={() => finish(false)}
              className="inline-flex items-center gap-1.5 px-7 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-extrabold shadow-sm cursor-pointer transition-all active:scale-95"
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

      {!finished && (
        <button
          type="button"
          onClick={() => finish(true)}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline cursor-pointer mt-1"
        >
          My mic isn’t working — skip this question
        </button>
      )}
    </div>
  );
}