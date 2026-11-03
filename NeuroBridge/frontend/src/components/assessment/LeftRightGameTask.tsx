import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';

/**
 * Q4 — "Robo's Left–Right Adventure".
 * Five quick rounds that check left/right without a camera:
 *   door   — "Tap the LEFT door" (doors have no labels)
 *   arrow  — which way is the arrow pointing? (answer with words)
 *   mirror — Sam is facing you: which hand is Sam waving? (the tricky one)
 * Every tap earns a star (no right/wrong shown); the result is recorded.
 */
type Side = 'left' | 'right';
type RoundKind = 'door' | 'arrow' | 'mirror';
interface Round {
  kind: RoundKind;
  answer: Side;
}

export interface LeftRightResult {
  correct: number;
  total: number;
  timesMs: number[];
  rounds: { kind: RoundKind; answer: Side; picked: Side; correct: boolean; ms: number }[];
}

const KINDS: RoundKind[] = ['door', 'arrow', 'mirror', 'door', 'arrow'];
const PASS_MARK = 4;

const randomSide = (): Side => (Math.random() < 0.5 ? 'left' : 'right');

function makeRounds(): Round[] {
  const rounds = KINDS.map((kind) => ({ kind, answer: randomSide() }));
  // Make sure both sides come up in the door rounds
  if (rounds[0].answer === rounds[3].answer) rounds[3].answer = rounds[0].answer === 'left' ? 'right' : 'left';
  return rounds;
}

/** Sam faces the viewer, so Sam's right hand is on the viewer's left. */
function Sam({ waving }: { waving: Side }) {
  const armOnViewerLeft = waving === 'right';
  return (
    <svg viewBox="0 0 200 200" className="w-44 h-44 sm:w-52 sm:h-52" role="img" aria-label="Sam is facing you and waving one hand">
      <ellipse cx="100" cy="188" rx="52" ry="7" fill="#E2E8F0" />
      {/* body */}
      <rect x="68" y="98" width="64" height="78" rx="24" fill="#22C55E" />
      {/* lowered arm */}
      <rect
        x={armOnViewerLeft ? 128 : 52}
        y="104"
        width="20"
        height="58"
        rx="10"
        fill="#16A34A"
      />
      {/* raised waving arm */}
      <g transform={armOnViewerLeft ? 'translate(58 104) rotate(150)' : 'translate(142 104) rotate(-150)'}>
        <rect x="-10" y="0" width="20" height="60" rx="10" fill="#16A34A" />
      </g>
      <text
        x={armOnViewerLeft ? 22 : 178}
        y="58"
        textAnchor="middle"
        fontSize="34"
      >
        ✋
      </text>
      {/* head */}
      <circle cx="100" cy="66" r="34" fill="#FDE68A" />
      <path d="M68 58 Q100 22 132 58" fill="#92400E" />
      <circle cx="88" cy="68" r="4" fill="#1E293B" />
      <circle cx="112" cy="68" r="4" fill="#1E293B" />
      <path d="M88 82 Q100 92 112 82" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Door({ onClick, disabled, highlight }: { onClick: () => void; disabled: boolean; highlight: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -4 }}
      whileTap={{ scale: 0.96 }}
      aria-label="Door"
      className={`relative w-28 h-40 sm:w-32 sm:h-48 rounded-t-[3rem] rounded-b-lg border-4 cursor-pointer transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${
        highlight ? 'border-amber-400 bg-amber-300' : 'border-amber-800 bg-amber-600 hover:bg-amber-500'
      }`}
    >
      <span className="absolute inset-x-4 top-6 h-12 rounded-t-3xl border-2 border-amber-800/40" aria-hidden />
      <span className="absolute right-4 top-1/2 w-3 h-3 rounded-full bg-yellow-200 shadow" aria-hidden />
    </motion.button>
  );
}

function WordChoice({ onPick, disabled, picked }: { onPick: (s: Side) => void; disabled: boolean; picked: Side | null }) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
      {(['left', 'right'] as Side[]).map((side) => (
        <motion.button
          key={side}
          type="button"
          onClick={() => onPick(side)}
          disabled={disabled}
          whileTap={{ scale: 0.96 }}
          className={`py-4 rounded-2xl border-2 text-lg font-black capitalize cursor-pointer transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${
            picked === side ? 'bg-amber-300 border-amber-400 text-[#1A202C]' : 'bg-white border-blue-200 text-[#1E3A8A] hover:bg-blue-50'
          }`}
        >
          {side === 'left' ? 'Left' : 'Right'}
        </motion.button>
      ))}
    </div>
  );
}

export function LeftRightGameTask({ onComplete }: { onComplete: (isCorrect: boolean, result: LeftRightResult) => void }) {
  const { reduceMotion } = useDyslexia();
  const [rounds] = useState<Round[]>(makeRounds);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Side | null>(null);
  const [results, setResults] = useState<LeftRightResult['rounds']>([]);
  const [done, setDone] = useState(false);
  const roundStart = useRef(0);
  useEffect(() => {
    roundStart.current = Date.now();
  }, []);

  const round = rounds[index];

  const pick = (side: Side) => {
    if (picked || done) return;
    const ms = Date.now() - roundStart.current;
    const entry = { kind: round.kind, answer: round.answer, picked: side, correct: side === round.answer, ms };
    const all = [...results, entry];
    setPicked(side);
    setResults(all);
    window.setTimeout(() => {
      setPicked(null);
      if (index < rounds.length - 1) {
        setIndex(index + 1);
        roundStart.current = Date.now();
      } else {
        setDone(true);
        const correct = all.filter((r) => r.correct).length;
        onComplete(correct >= PASS_MARK, {
          correct,
          total: all.length,
          timesMs: all.map((r) => r.ms),
          rounds: all,
        });
      }
    }, 550);
  };

  const prompt =
    round.kind === 'door'
      ? (
          <>
            Robo wants the <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-[#1D4ED8] uppercase">{round.answer}</span> door. Tap it!
          </>
        )
      : round.kind === 'arrow'
        ? 'Which way is the arrow pointing?'
        : 'Sam is facing you. Which hand is Sam waving?';

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-5 p-4 sm:p-6">
      {/* Header + stars */}
      <div className="w-full flex items-center justify-between gap-3">
        <div className="text-left">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#2563EB]">Left or right?</p>
          <h2 className="font-black text-[#1A202C]" style={{ fontSize: 'clamp(1.15rem, 2.6vw, 1.5rem)' }}>
            Robo’s left–right adventure
          </h2>
        </div>
        <div className="flex gap-1" aria-label={`${results.length} of ${rounds.length} stars`}>
          {rounds.map((_, i) => (
            <Star
              key={i}
              size={22}
              className={i < results.length ? 'text-amber-400' : 'text-slate-200'}
              fill="currentColor"
              aria-hidden
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 flex flex-col items-center gap-3 text-center"
          >
            <span className="text-6xl" aria-hidden>
              🤖🎉
            </span>
            <p className="text-xl font-black text-[#1A202C]">You got all 5 stars!</p>
            <p className="text-sm font-semibold text-slate-500">Press Next to keep going.</p>
          </motion.div>
        ) : (
          <motion.div
            key={index}
            initial={reduceMotion ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -30 }}
            className="w-full flex flex-col items-center gap-6"
          >
            <p className="text-center font-bold text-[#1A202C]" style={{ fontSize: 'clamp(1.05rem, 2.4vw, 1.3rem)' }}>
              {prompt}
            </p>

            {round.kind === 'door' && (
              <div className="flex items-end justify-center gap-6 sm:gap-10">
                <Door onClick={() => pick('left')} disabled={!!picked} highlight={picked === 'left'} />
                <motion.span
                  className="text-5xl mb-4"
                  aria-hidden
                  animate={reduceMotion || !picked ? undefined : { x: picked === 'left' ? -40 : 40 }}
                >
                  🤖
                </motion.span>
                <Door onClick={() => pick('right')} disabled={!!picked} highlight={picked === 'right'} />
              </div>
            )}

            {round.kind === 'arrow' && (
              <>
                <div className="w-40 h-28 rounded-3xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-[#2563EB]">
                  {round.answer === 'left' ? <ArrowLeft size={84} strokeWidth={3} aria-label="Arrow" /> : <ArrowRight size={84} strokeWidth={3} aria-label="Arrow" />}
                </div>
                <WordChoice onPick={pick} disabled={!!picked} picked={picked} />
              </>
            )}

            {round.kind === 'mirror' && (
              <>
                <Sam waving={round.answer} />
                <WordChoice onPick={pick} disabled={!!picked} picked={picked} />
              </>
            )}

            <p className="text-xs font-semibold text-slate-500">{`Round ${index + 1} of ${rounds.length}`}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
