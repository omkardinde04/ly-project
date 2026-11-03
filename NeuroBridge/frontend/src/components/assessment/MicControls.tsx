import { motion } from 'framer-motion';
import { Mic, Square, AlertTriangle, RotateCcw } from 'lucide-react';
import type { MicError, MicStatus } from './useSpeechCapture';

/** Big round mic button; a ring grows with your voice while listening. */
export function MicButton({
  status,
  level,
  onStart,
  onStop,
  reduceMotion = false,
}: {
  status: MicStatus;
  level: number;
  onStart: () => void;
  onStop: () => void;
  reduceMotion?: boolean;
}) {
  const listening = status === 'listening';
  const starting = status === 'starting';
  const ring = 1 + Math.min(level, 1) * 0.55;

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      {listening && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-rose-400/25"
          animate={{ scale: reduceMotion ? 1.08 : ring }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      )}
      {listening && !reduceMotion && (
        <motion.span
          aria-hidden
          className="absolute inset-2 rounded-full border-2 border-rose-300"
          animate={{ scale: [1, 1.18], opacity: [0.7, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
        />
      )}
      <motion.button
        type="button"
        onClick={listening ? onStop : onStart}
        disabled={starting}
        whileHover={reduceMotion ? undefined : { scale: 1.05 }}
        whileTap={reduceMotion ? undefined : { scale: 0.95 }}
        aria-label={listening ? 'Stop recording' : 'Start recording'}
        aria-pressed={listening}
        className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 disabled:cursor-wait ${
          listening
            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200'
            : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-blue-200'
        }`}
      >
        {listening ? <Square size={30} fill="currentColor" /> : <Mic size={38} />}
      </motion.button>
    </div>
  );
}

/** Five bars that move with the voice — proof the mic is working. */
export function LevelBars({ level, active }: { level: number; active: boolean }) {
  const bars = [0.35, 0.7, 1, 0.7, 0.35];
  return (
    <div className="flex items-end justify-center gap-1 h-6" aria-hidden>
      {bars.map((w, i) => (
        <span
          key={i}
          className={`w-1.5 rounded-full transition-[height] duration-100 ${active ? 'bg-rose-400' : 'bg-slate-200'}`}
          style={{ height: `${Math.max(4, Math.min(24, (active ? level : 0) * 24 * w * 1.6 + 4))}px` }}
        />
      ))}
    </div>
  );
}

/** Thin bar showing time left. */
export function TimeBar({ elapsedMs, maxMs }: { elapsedMs: number; maxMs: number }) {
  const left = Math.max(0, Math.ceil((maxMs - elapsedMs) / 1000));
  const pct = Math.min(100, (elapsedMs / maxMs) * 100);
  return (
    <div className="w-full max-w-xs">
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full bg-rose-400 transition-[width] duration-200 ease-linear" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[11px] font-bold text-slate-500 text-center tabular-nums">{`${left}s left`}</p>
    </div>
  );
}

export function MicErrorBox({ error, onRetry, onSkip }: { error: MicError; onRetry: () => void; onSkip: () => void }) {
  return (
    <div role="alert" className="w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
      <div className="flex gap-3">
        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-3">
          <p className="text-sm font-semibold text-amber-900">{error.message}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold cursor-pointer"
            >
              <RotateCcw size={14} />
              Try again
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2 rounded-xl bg-white border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 cursor-pointer"
            >
              Skip this question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
