import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mic, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';

export interface ReadingMetrics {
  readingTimeMs: number;
  readingTimeSec: number;
  correctWords: number;
  wrongWords: number;
  totalWords: number;
  accuracyPct: number;
}

interface ReadingRereadTaskProps {
  question: any;
  onComplete?: (rereadCount: number, metrics?: ReadingMetrics) => void;
}

const cleanWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const v0 = new Array(b.length + 1);
  const v1 = new Array(b.length + 1);
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

function wordsMatch(target: string, spoken: string): boolean {
  if (!target || !spoken) return false;
  if (target === spoken) return true;
  // Handle apostrophes and contractions
  const t = target.replace(/['’]/g, '');
  const s = spoken.replace(/['’]/g, '');
  if (t === s) return true;
  // Common singular/plural, -s, -es, -ed, -ing, -ly endings
  if (t.replace(/s$/, '') === s.replace(/s$/, '')) return true;
  if (t.replace(/(ed|ing|es|s|ly)$/, '') === s.replace(/(ed|ing|es|s|ly)$/, '')) return true;
  // Stem match for words of 4+ characters
  if (t.length >= 4 && s.length >= 4 && t.slice(0, 4) === s.slice(0, 4)) return true;
  // Levenshtein edit distance check (accommodates minor engine phoneme variations)
  const dist = levenshtein(t, s);
  if (t.length >= 7 && dist <= 2) return true;
  if (t.length >= 4 && dist <= 1) return true;
  return false;
}

function alignWords(targetWords: string[], spokenWords: string[]) {
  const statuses: ('idle' | 'green' | 'red')[] = Array(targetWords.length).fill('idle');
  if (!spokenWords || spokenWords.length === 0) {
    return { statuses, nextIndex: 0, correct: 0, wrong: 0, rereads: 0 };
  }

  let t = 0;
  let s = 0;
  let rereads = 0;

  while (s < spokenWords.length && t < targetWords.length) {
    const target = targetWords[t];
    const spoken = spokenWords[s];

    if (wordsMatch(target, spoken)) {
      statuses[t] = 'green';
      t++;
      s++;
    } else {
      // Check if student skipped ahead to an upcoming target word
      let lookaheadTarget = -1;
      for (let k = t + 1; k < Math.min(targetWords.length, t + 4); k++) {
        if (wordsMatch(targetWords[k], spoken)) {
          lookaheadTarget = k;
          break;
        }
      }

      // Check if next spoken word matches current target word (filler/hesitation word spoken)
      let lookaheadSpoken = false;
      if (s + 1 < spokenWords.length && wordsMatch(target, spokenWords[s + 1])) {
        lookaheadSpoken = true;
      }

      // Check if student re-read an earlier word
      let isReread = false;
      for (let prev = Math.max(0, t - 4); prev < t; prev++) {
        if (wordsMatch(targetWords[prev], spoken)) {
          isReread = true;
          rereads++;
          break;
        }
      }

      if (isReread) {
        s++;
      } else if (lookaheadTarget !== -1) {
        // Words in between were skipped or misread -> mark RED
        for (let skip = t; skip < lookaheadTarget; skip++) {
          statuses[skip] = 'red';
        }
        statuses[lookaheadTarget] = 'green';
        t = lookaheadTarget + 1;
        s++;
      } else if (lookaheadSpoken) {
        // Extra spoken filler word, advance spoken stream
        s++;
      } else {
        // Mispronounced / wrong word substitution -> mark RED
        statuses[t] = 'red';
        t++;
        s++;
      }
    }
  }

  const correct = statuses.filter((st) => st === 'green').length;
  const wrong = statuses.filter((st) => st === 'red').length;

  return {
    statuses,
    nextIndex: Math.min(t, targetWords.length - 1),
    correct,
    wrong,
    rereads,
  };
}

export function ReadingRereadTask({ question, onComplete }: ReadingRereadTaskProps) {
  // Paragraph text
  const paragraphText: string =
    typeof question?.paragraph === 'string'
      ? question.paragraph
      : Array.isArray(question?.paragraph)
      ? question.paragraph[0]
      : 'Dyslexia is not a reflection of intelligence. It is simply a different way that the brain processes language. Many highly successful people are dyslexic.';

  const words: string[] = useMemo(() => paragraphText.trim().split(/\s+/), [paragraphText]);
  const cleanWords: string[] = useMemo(() => words.map(cleanWord), [words]);

  const [wordStatuses, setWordStatuses] = useState<('idle' | 'green' | 'red')[]>(() =>
    Array(words.length).fill('idle'),
  );
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);

  // Accurate reading time refs (measured quietly, never displayed to the student)
  const startTimeRef = useRef<number>(0);
  const readingTimeSecRef = useRef<number>(0);
  const isListeningRef = useRef(false);
  const recogRef = useRef<any>(null);
  const isMountedRef = useRef(true);
  const autoFinishTimerRef = useRef<any>(null);

  // Unmount cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      isListeningRef.current = false;
      if (autoFinishTimerRef.current) clearTimeout(autoFinishTimerRef.current);
      if (recogRef.current) {
        try {
          recogRef.current.onend = null;
          recogRef.current.onerror = null;
          recogRef.current.onresult = null;
          recogRef.current.stop();
        } catch {
          /* ignore */
        }
        recogRef.current = null;
      }
    };
  }, []);

  const startReading = () => {
    setMicError(null);
    setIsListening(true);
    isListeningRef.current = true;
    startTimeRef.current = Date.now();

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setMicError('Speech recognition is not supported in this browser. Please use Chrome or Edge for this question, or read aloud and press Finish Reading.');
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.lang = 'en-US';
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onresult = (event: any) => {
        let full = '';
        for (let i = 0; i < event.results.length; i++) {
          const piece = event.results[i][0]?.transcript || '';
          full += piece + ' ';
        }
        const cleaned = full.trim();
        if (isMountedRef.current) {
          setTranscript(cleaned);
        }
      };

      rec.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event?.error);
        if (!isMountedRef.current) return;
        if (event?.error === 'not-allowed') {
          setMicError('Microphone permission blocked. Please allow microphone access in your browser settings.');
        } else if (event?.error !== 'no-speech' && event?.error !== 'aborted') {
          // Log non-critical error without breaking UI
        }
      };

      rec.onend = () => {
        // If still in reading mode, automatically restart to handle Chrome silence pauses
        if (isListeningRef.current && isMountedRef.current) {
          try {
            rec.start();
          } catch {
            /* already active or busy */
          }
        }
      };

      recogRef.current = rec;
      rec.start();
    } catch (e: any) {
      console.error('Error starting speech recognition:', e);
      setMicError('Microphone could not be started. You can still read aloud and finish when done.');
    }
  };

  const finishReading = () => {
    isListeningRef.current = false;
    setIsListening(false);
    setIsCompleted(true);
    if (autoFinishTimerRef.current) clearTimeout(autoFinishTimerRef.current);

    if (recogRef.current) {
      try {
        recogRef.current.onend = null;
        recogRef.current.onerror = null;
        recogRef.current.onresult = null;
        recogRef.current.stop();
      } catch {
        /* ignore */
      }
      recogRef.current = null;
    }

    // Note down reading time in seconds (quietly measured, NOT shown to the user)
    const elapsedMs = startTimeRef.current > 0 ? Date.now() - startTimeRef.current : 0;
    const elapsedSec = Math.max(1, Math.round((elapsedMs / 1000) * 10) / 10);
    readingTimeSecRef.current = elapsedSec;

    const correct = wordStatuses.filter((st) => st === 'green').length;
    const wrong = wordStatuses.filter((st) => st === 'red').length;

    if (onComplete) {
      onComplete(0, {
        readingTimeMs: elapsedMs,
        readingTimeSec: elapsedSec,
        correctWords: correct,
        wrongWords: wrong,
        totalWords: words.length,
        accuracyPct: Math.round((correct / (words.length || 1)) * 100),
      });
    }
  };

  const resetTask = () => {
    isListeningRef.current = false;
    setIsListening(false);
    setIsCompleted(false);
    setTranscript('');
    setMicError(null);
    setWordStatuses(Array(words.length).fill('idle'));
    setCurrentWordIndex(0);
    startTimeRef.current = 0;
    if (recogRef.current) {
      try {
        recogRef.current.onend = null;
        recogRef.current.stop();
      } catch {
        /* ignore */
      }
      recogRef.current = null;
    }
  };

  // Convert transcript into spoken words and align with paragraph
  const spokenWords = useMemo(() => {
    return transcript.toLowerCase().split(/\s+/).map(cleanWord).filter(Boolean);
  }, [transcript]);

  useEffect(() => {
    if (!isListening) return;
    if (spokenWords.length === 0) return;

    const { statuses, nextIndex, correct, wrong } = alignWords(cleanWords, spokenWords);
    setWordStatuses(statuses);
    setCurrentWordIndex(nextIndex);

    // If reader reached the end of the text, auto-finish smoothly after a brief pause
    if (nextIndex >= cleanWords.length - 1 && correct + wrong >= cleanWords.length) {
      if (!autoFinishTimerRef.current) {
        autoFinishTimerRef.current = window.setTimeout(() => {
          if (isMountedRef.current && isListeningRef.current) {
            finishReading();
          }
        }, 1500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spokenWords, cleanWords, isListening]);

  return (
    <div className="w-full flex flex-col items-center bg-transparent py-5 sm:py-7 px-4" style={{ minHeight: '0' }}>
      <div className="w-full max-w-[580px] flex flex-col gap-5 sm:gap-6 mx-auto">
        {/* Header Block: Calm title without showing reading time / timer */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white mb-1">
            Reading Passage
          </h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Read aloud at your natural pace →
          </p>
        </div>

        {/* Status / Mic Control Strip */}
        <div className="flex flex-col items-center gap-2 w-full">
          {!isListening && !isCompleted && (
            <button
              type="button"
              onClick={startReading}
              className="px-7 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-98 text-white font-extrabold text-sm sm:text-base shadow-md shadow-blue-500/25 flex items-center gap-2.5 transition-all cursor-pointer group"
            >
              <Mic size={18} className="group-hover:scale-110 transition-transform" />
              <span>Start Reading Aloud</span>
            </button>
          )}

          {isListening && (
            <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800/60 font-bold text-xs sm:text-sm shadow-2xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Listening to your voice... Read clearly</span>
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 font-bold text-sm shadow-2xs">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>Reading Completed</span>
            </div>
          )}

          {micError && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs font-semibold max-w-md text-center">
              <AlertCircle size={15} className="shrink-0 text-amber-600" />
              <span>{micError}</span>
            </div>
          )}
        </div>

        {/* Paragraph Container with Live Right/Wrong Word Detection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-left bg-white dark:bg-slate-900/70 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs w-full p-6 sm:p-8 text-lg sm:text-xl text-slate-700 dark:text-slate-200"
          style={{ lineHeight: 2, letterSpacing: '0.02em' }}
        >
          {words.map((word, idx) => {
            // Words are marked only from what the microphone hears, never by clicking
            let statusClass = 'text-slate-700 dark:text-slate-300';

            if (wordStatuses[idx] === 'green') {
              statusClass =
                'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 font-bold rounded-lg px-1.5 py-0.5 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs';
            } else if (wordStatuses[idx] === 'red') {
              statusClass =
                'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 font-bold rounded-lg px-1.5 py-0.5 border border-rose-200 dark:border-rose-800/60 line-through decoration-rose-400 decoration-2 shadow-2xs';
            }

            const isSpotlight =
              idx === currentWordIndex && isListening && wordStatuses[idx] === 'idle';
            if (isSpotlight) {
              statusClass =
                'text-blue-900 dark:text-blue-100 bg-blue-100 dark:bg-blue-950/80 font-extrabold rounded-lg px-1.5 py-0.5 border-2 border-blue-400 dark:border-blue-500 shadow-2xs ring-2 ring-blue-100 dark:ring-blue-900/40 z-10 relative';
            }

            return (
              <span
                key={idx}
                className={`inline-block mx-1 my-1 transition-all duration-200 rounded select-none ${statusClass}`}
              >
                {word}
              </span>
            );
          })}
        </motion.div>

        {/* Live Subtitle Transcript Feedback */}
        <div className="w-full text-center text-xs sm:text-sm text-slate-400 italic overflow-hidden text-ellipsis whitespace-nowrap min-h-[22px]">
          {transcript
            ? `"${transcript.slice(-48)}"`
            : isListening
            ? 'Start reading aloud...'
            : 'Press Start Reading Aloud when you are ready.'}
        </div>

        {/* Bottom Actions: Finish Reading or Retake */}
        <div className="flex items-center justify-center gap-3">
          {isListening && (
            <button
              type="button"
              onClick={finishReading}
              className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm sm:text-base shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 size={18} strokeWidth={2.5} />
              <span>Finish Reading</span>
            </button>
          )}

          {isCompleted && (
            <button
              type="button"
              onClick={resetTask}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Read Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
