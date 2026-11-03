import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import type { Language } from '../../contexts/DyslexiaContext';
import type { GameResult } from './ProgressGame';
import { API_BASE } from '../../config/api';

type SkillId = 'sound' | 'focus' | 'memory' | 'speed';
type PublicQuestion = { index: number; total: number; prompt: string; options: string[] };
type ReviewQuestion = { prompt: string; options: string[]; correctAnswer: number; selectedOption: number };
type Run = {
  runId: string;
  status: 'active' | 'complete';
  question: PublicQuestion | null;
  result: { correct: number; total: number } | null;
  reviewQuestions?: ReviewQuestion[];
};
type Props = {
  skillId: SkillId;
  skillName: string;
  rating: number;
  token: string;
  language: Language;
  onComplete: (result: GameResult) => void;
  onExit: () => void;
};

const text = {
  en: { title: 'Adaptive practice', description: 'Questions adjust to your answers. You will see your score at the end.', start: 'Start test', loading: 'Preparing your test…', choose: 'Choose an answer', next: 'Submit answer', finish: 'Finish test', review: 'Review missed questions (optional)', reviewTitle: 'Practice missed questions', nextReview: 'Next missed question', done: 'Finish review', correct: 'That is correct.', answer: 'The correct answer is', score: 'Final score', accuracy: 'Accuracy', back: 'Back to practice', error: 'Could not load the test.', retry: 'Try again', selected: 'Choose an option to continue.' },
  hi: { title: 'अनुकूल अभ्यास', description: 'आपके उत्तरों के अनुसार प्रश्न बदलते हैं। स्कोर अंत में दिखेगा।', start: 'टेस्ट शुरू करें', loading: 'टेस्ट तैयार हो रहा है…', choose: 'उत्तर चुनें', next: 'उत्तर जमा करें', finish: 'टेस्ट पूरा करें', review: 'गलत प्रश्नों का अभ्यास करें (वैकल्पिक)', reviewTitle: 'गलत प्रश्नों का अभ्यास', nextReview: 'अगला गलत प्रश्न', done: 'अभ्यास समाप्त करें', correct: 'यह सही है।', answer: 'सही उत्तर है', score: 'अंतिम स्कोर', accuracy: 'सटीकता', back: 'अभ्यास पर लौटें', error: 'टेस्ट लोड नहीं हो सका।', retry: 'फिर कोशिश करें', selected: 'जारी रखने के लिए एक विकल्प चुनें।' },
  mr: { title: 'अनुकूल सराव', description: 'तुमच्या उत्तरांनुसार प्रश्न बदलतात. गुण शेवटी दिसतील.', start: 'चाचणी सुरू करा', loading: 'चाचणी तयार होत आहे…', choose: 'उत्तर निवडा', next: 'उत्तर सबमिट करा', finish: 'चाचणी पूर्ण करा', review: 'चुकलेल्या प्रश्नांचा सराव (पर्यायी)', reviewTitle: 'चुकलेल्या प्रश्नांचा सराव', nextReview: 'पुढील चुकलेला प्रश्न', done: 'सराव पूर्ण करा', correct: 'हे बरोबर आहे.', answer: 'बरोबर उत्तर', score: 'अंतिम गुण', accuracy: 'अचूकता', back: 'सरावाकडे परत जा', error: 'चाचणी लोड करता आली नाही.', retry: 'पुन्हा प्रयत्न करा', selected: 'पुढे जाण्यासाठी पर्याय निवडा.' },
} as const;

export function AdaptivePracticeGame({ skillId, skillName, rating, token, language, onComplete, onExit }: Props) {
  const t = text[language] || text.en;
  const [run, setRun] = useState<Run | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const [reviewSelected, setReviewSelected] = useState<number | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setStarting(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/progress/adaptive/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ skill: skillId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.error);
      setRun(data);
      setStartedAt(Date.now());
    } catch (value) {
      setError(value instanceof Error ? value.message : t.error);
    } finally {
      setStarting(false);
    }
  };

  const submitAnswer = async () => {
    if (!run || !run.question || selected === null || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/progress/adaptive/${run.runId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answer: selected, questionIndex: run.question.index }),
      });
      const data = await response.json() as Run & { error?: string };
      if (!response.ok) throw new Error(data.error || t.error);
      setRun(data);
      setSelected(null);
      if (data.status === 'complete' && data.result && startedAt !== null) {
        const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        const rawDelta = Math.round((data.result.correct / data.result.total - 0.6) * 10);
        onComplete({
          skillId,
          correct: data.result.correct,
          total: data.result.total,
          seconds,
          delta: rawDelta < 0 ? -Math.min(Math.abs(rawDelta), rating) : rawDelta,
          mode: 'practice',
        });
      }
    } catch (value) {
      setError(value instanceof Error ? value.message : t.error);
    } finally {
      setSubmitting(false);
    }
  };

  const review = run?.reviewQuestions || [];
  const finishReview = () => {
    setReviewIndex(null);
    setReviewSelected(null);
    setReviewSubmitted(false);
  };

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-9">
      <button onClick={onExit} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-700">
        <ArrowLeft size={16} /> {t.back}
      </button>

      <div className="mb-7 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Sparkles size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-black text-slate-900">{t.title}: {skillName}</h1>
          <p className="mt-1 text-sm text-slate-600">{t.description}</p>
        </div>
      </div>

      {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

      {!run ? (
        <button onClick={start} disabled={starting} className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white disabled:opacity-60">
          {starting ? t.loading : t.start}
        </button>
      ) : run.status === 'complete' && run.result ? (
        <div>
          <div className="rounded-2xl bg-blue-50 p-6 text-center">
            <CheckCircle2 size={32} className="mx-auto text-blue-600" />
            <p className="mt-3 text-sm font-bold uppercase tracking-wide text-slate-600">{t.score}</p>
            <p className="mt-1 text-4xl font-black text-slate-900">{run.result.correct}/{run.result.total}</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">{t.accuracy}: {Math.round(run.result.correct / run.result.total * 100)}%</p>
          </div>

          {review.length > 0 && reviewIndex === null && (
            <button onClick={() => setReviewIndex(0)} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-blue-200 px-5 py-3 font-bold text-blue-700 hover:bg-blue-50">
              <RotateCcw size={17} /> {t.review} ({review.length})
            </button>
          )}

          {reviewIndex !== null && review[reviewIndex] && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
              <h2 className="text-lg font-extrabold text-slate-900">{t.reviewTitle} · {reviewIndex + 1}/{review.length}</h2>
              <p className="mt-4 font-bold text-slate-800">{review[reviewIndex].prompt}</p>
              <div className="mt-4 grid gap-2">
                {review[reviewIndex].options.map((option, index) => (
                  <button
                    key={`${option}-${index}`}
                    onClick={() => { setReviewSelected(index); setReviewSubmitted(false); }}
                    className={`rounded-xl border p-3 text-left font-semibold ${reviewSelected === index ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </button>
                ))}
              </div>
              {reviewSubmitted && reviewSelected !== null && (
                <p className={`mt-3 text-sm font-bold ${reviewSelected === review[reviewIndex].correctAnswer ? 'text-green-700' : 'text-amber-800'}`}>
                  {reviewSelected === review[reviewIndex].correctAnswer
                    ? t.correct
                    : `${t.answer}: ${review[reviewIndex].options[review[reviewIndex].correctAnswer]}`}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                {!reviewSubmitted ? (
                  <button disabled={reviewSelected === null} onClick={() => setReviewSubmitted(true)} className="rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white disabled:opacity-50">{t.next}</button>
                ) : reviewIndex + 1 < review.length ? (
                  <button onClick={() => { setReviewIndex(reviewIndex + 1); setReviewSelected(null); setReviewSubmitted(false); }} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white">{t.nextReview} <ArrowRight size={16} /></button>
                ) : (
                  <button onClick={finishReview} className="rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white">{t.done}</button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : run.question ? (
        <div>
          <div className="mb-5 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
            <span>Question {run.question.index + 1} of {run.question.total}</span>
            <span>{skillName}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${run.question.index / run.question.total * 100}%` }} />
          </div>
          <h2 className="mt-6 text-xl font-extrabold leading-snug text-slate-900 sm:text-2xl">{run.question.prompt}</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">{t.choose}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {run.question.options.map((option, index) => (
              <button
                key={`${option}-${index}`}
                disabled={submitting}
                onClick={() => setSelected(index)}
                className={`rounded-xl border-2 p-4 text-left font-semibold transition ${selected === index ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 hover:border-blue-300'}`}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}
          </div>
          {selected === null && <p className="mt-4 text-xs font-medium text-slate-500">{t.selected}</p>}
          <button onClick={submitAnswer} disabled={selected === null || submitting} className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white disabled:opacity-50">
            {submitting ? t.loading : run.question.index + 1 === run.question.total ? t.finish : t.next}
          </button>
        </div>
      ) : (
        <p role="alert" className="font-semibold text-red-700">{t.error}</p>
      )}
    </div>
  );
}
