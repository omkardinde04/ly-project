import { useEffect, useState } from 'react';
import { Clock3, Trophy } from 'lucide-react';
import type { Language } from '../../contexts/DyslexiaContext';

type Player = { name: string; rating: number; correct: number | null; index: number; finishedAt?: string };
type Battle = { status: 'countdown' | 'active' | 'complete'; total: number; waitingForOpponent: boolean; startedAt: string; endsAt: string; question: { index: number; total: number; prompt: string; options: string[] } | null; you: Player; opponent: Player; result: { winnerId: string | null; yourRating: number; opponentRating: number; yourRatingChange: number; opponentRatingChange: number } | null };
type Props = { matchId: string; token: string; language: Language; userId: string; onExit: () => void; onResult: (result: { correct: number; total: number; seconds: number; delta: number }) => void };

const copy = {
  en: { you: 'YOU', opponent: 'OPPONENT', question: 'Question', choose: 'Choose an answer', wait: 'Waiting for the other player', win: 'WIN', loss: 'LOSS', draw: 'DRAW', score: 'Final score', rating: 'Rating', change: 'Rating change', back: 'Back to Arena' },
  hi: { you: 'आप', opponent: 'प्रतिद्वंद्वी', question: 'प्रश्न', choose: 'उत्तर चुनें', wait: 'दूसरे खिलाड़ी की प्रतीक्षा', win: 'जीत', loss: 'हार', draw: 'ड्रा', score: 'अंतिम स्कोर', rating: 'रेटिंग', change: 'रेटिंग बदलाव', back: 'एरिना पर वापस जाएं' },
  mr: { you: 'तुम्ही', opponent: 'प्रतिस्पर्धक', question: 'प्रश्न', choose: 'उत्तर निवडा', wait: 'दुसऱ्या खेळाडूची प्रतीक्षा', win: 'विजय', loss: 'पराभव', draw: 'सामना बरोबरीत', score: 'अंतिम गुण', rating: 'रेटिंग', change: 'गुणांमधील बदल', back: 'एरिनामध्ये परत जा' },
};

export function BattleGame({ matchId, token, language, userId, onExit, onResult }: Props) {
  const t = copy[language];
  const [battle, setBattle] = useState<Battle | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [requestError, setRequestError] = useState<string | null>(null);

  const load = () => fetch(`http://localhost:4000/api/progress/battle/${matchId}`, { headers: { Authorization: `Bearer ${token}` } }).then(response => response.json()).then(data => { setBattle(data); if (data.status === 'active' && started === null) setStarted(Date.now()); }).catch(() => undefined);
  useEffect(() => { load(); const timer = window.setInterval(load, 1000); return () => window.clearInterval(timer); }, [matchId, token]);
  useEffect(() => { if (!battle || battle.status !== 'countdown') return; const timer = window.setInterval(() => { const remaining = Math.max(0, Math.ceil((new Date(battle.startedAt).getTime() - Date.now()) / 1000)); setCountdown(remaining); }, 100); return () => window.clearInterval(timer); }, [battle]);
  useEffect(() => { if (!battle || battle.status !== 'active') return; const timer = window.setInterval(() => setSecondsLeft(Math.max(0, Math.ceil((new Date(battle.endsAt).getTime() - Date.now()) / 1000))), 250); return () => window.clearInterval(timer); }, [battle]);
  useEffect(() => { if (battle?.status === 'complete' && battle.result && battle.you.correct !== null && started !== null) onResult({ correct: battle.you.correct, total: battle.total, seconds: Math.max(1, Math.round((Date.now() - started) / 1000)), delta: battle.result.yourRatingChange }); }, [battle?.status]);

  const submitAnswer = async (value: number) => {
    if (!battle?.question || submitting) return;
    setSelected(value);
    setSubmitting(true);
    setRequestError(null);
    try {
      const response = await fetch(`http://localhost:4000/api/progress/battle/${matchId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answer: value, questionIndex: battle.question.index }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save your answer.');
      setBattle(data);
      setSelected(null);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Could not save your answer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!battle) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827] text-xl font-black text-white">Connecting to battle...</div>;
  if (battle.status === 'complete' && battle.result && battle.you.correct !== null && battle.opponent.correct !== null) {
    const won = battle.result.winnerId === userId;
    const tied = battle.result.winnerId === null;
    const startingRating = battle.result.yourRating - battle.result.yourRatingChange;
    const opponentStartingRating = battle.result.opponentRating - battle.result.opponentRatingChange;
    return (
      <div className="fixed inset-0 z-[9998] flex items-center justify-center overflow-auto bg-[#111827] p-5 text-white">
        <RatingRibbon label={t.rating} rating={battle.result.yourRating} />
        <div className="w-full max-w-xl text-center">
          <Trophy className="mx-auto mb-5 text-[#f2a93b]" size={64} />
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#f2a93b]">{tied ? t.draw : won ? t.win : t.loss}</p>
          <h1 className="mt-2 text-5xl font-black">{battle.you.correct} - {battle.opponent.correct}</h1>
          <div className="mx-auto my-8 grid max-w-md grid-cols-2 gap-3">
            {[{ label: t.you, score: battle.you.correct }, { label: t.opponent, score: battle.opponent.correct }].map(player => (
              <div key={player.label} className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs font-bold text-white/60">{player.label} · {t.score}</p>
                <p className="mt-1 text-3xl font-black">{player.score}</p>
              </div>
            ))}
            {[{ label: t.you, before: startingRating, after: battle.result.yourRating, change: battle.result.yourRatingChange }, { label: t.opponent, before: opponentStartingRating, after: battle.result.opponentRating, change: battle.result.opponentRatingChange }].map(player => (
              <div key={player.label} className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs font-bold text-white/60">{player.label} · {t.rating}</p>
                <p className="mt-1 text-xl font-black">{player.before} → {player.after}</p>
                <p className={`text-sm font-black ${player.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {t.change}: {player.change >= 0 ? '+' : ''}{player.change}
                </p>
              </div>
            ))}
          </div>
          <button onClick={onExit} className="rounded-xl bg-[#e86f51] px-8 py-3 font-black">{t.back}</button>
        </div>
      </div>
    );
  }
  const remaining = battle.total ? Math.round((battle.you.index / battle.total) * 100) : 0;
  return <div className="fixed inset-0 z-[9998] overflow-auto bg-[#111827] p-4 text-white sm:p-8"><RatingRibbon label={t.rating} rating={battle.you.rating} /><div className="mx-auto max-w-4xl"><div className="grid grid-cols-2 gap-3"><PlayerBar label={t.you} ratingLabel={t.rating} player={battle.you} color="bg-[#4a90e2]" total={battle.total} /><PlayerBar label={t.opponent} ratingLabel={t.rating} player={battle.opponent} color="bg-[#e86f51]" total={battle.total} /></div>{battle.status === 'countdown' ? <div className="flex min-h-[60vh] flex-col items-center justify-center"><p className="text-sm font-black uppercase tracking-[0.35em] text-white/60">Get ready</p><div className="mt-4 text-9xl font-black text-[#f2a93b]">{countdown > 0 ? countdown : 'GO'}</div></div> : <div className="mx-auto mt-10 max-w-2xl rounded-3xl bg-white p-6 text-[#111827] shadow-2xl sm:p-10"><div className="mb-5 flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-500"><span><Clock3 className="mr-1 inline" size={14} />{t.question} {(battle.question?.index ?? Math.min(battle.you.index, battle.opponent.index)) + 1} of {battle.total}</span><span className="text-lg font-black text-[#e86f51]">{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</span></div>{requestError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{requestError}</p>}<div className="mb-5 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-[#4a90e2] transition-all" style={{ width: `${remaining}%` }} /></div>{battle.question ? <><h1 className="text-2xl font-black sm:text-3xl">{battle.question.prompt}</h1><p className="mt-2 text-sm font-semibold text-gray-500">{t.choose}</p><div className="mt-7 grid gap-3">{battle.question.options.map((option, index) => <button key={option} disabled={submitting} onClick={() => submitAnswer(index)} className={`rounded-xl border-2 p-4 text-left font-black transition ${selected === index ? 'border-[#4a90e2] bg-blue-50' : 'border-gray-200 hover:border-[#4a90e2]'}`}>{String.fromCharCode(65 + index)}. {option}</button>)}</div></> : <div className="py-20 text-center font-black text-gray-500">{t.wait}...</div>}</div>}</div></div>;
}

function RatingRibbon({ label, rating }: { label: string; rating: number }) {
  return (
    <div
      className="pointer-events-none fixed left-0 top-3 z-[9999] flex min-w-40 items-center gap-3 rounded-r-2xl border-y-2 border-r-2 border-[#b77700] bg-[#f2a93b] px-5 py-3 text-[#111827] shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
      style={{ zIndex: 2147483647, top: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <span className="text-xs font-black uppercase tracking-wider">{label}</span>
      <span className="text-3xl font-black leading-none">{rating}</span>
    </div>
  );
}

function PlayerBar({ label, ratingLabel, player, color, total }: { label: string; ratingLabel: string; player: Player; color: string; total: number }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/60">{label}</p>
          <p className="font-black">{player.name}</p>
        </div>
        <div className="rounded-xl bg-black/20 px-4 py-2 text-right">
          <p className="text-[10px] font-black uppercase tracking-wider text-white/60">{ratingLabel}</p>
          <p className="text-2xl font-black leading-tight">{player.rating}</p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full ${color} transition-all`} style={{ width: `${Math.min(100, player.index / total * 100)}%` }} />
      </div>
    </div>
  );
}
