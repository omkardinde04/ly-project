/**
 * Turns the raw assessment results into numbers the report can chart.
 *
 * Per skill we combine two real measurements:
 *   • Part A — each question is tagged with the skill it tests; an answer's
 *     weight (0 = no difficulty … 3 = a lot) becomes 100 … 0.
 *   • Part B — the six cognitive tasks each give a 0–100 accuracy score.
 * The skill score is the average of whichever of the two exist.
 * Higher is always better here: low numbers are the areas to grow.
 */
import { partAQuestions } from './assessmentQuestions';

export type SkillId = 'phonological' | 'visual' | 'workingMemory' | 'processingSpeed' | 'orthographic' | 'executive';

export interface SkillMeta {
  id: SkillId;
  name: string; // short, plain words
  short: string; // chart label
  what: string; // one line: what it means
  tip: string; // one line: how to practise
  practice: { label: string; to: string };
}

export const SKILLS: SkillMeta[] = [
  {
    id: 'phonological',
    name: 'Sounds in words',
    short: 'Sounds',
    what: 'Hearing and joining the sounds in a word.',
    tip: 'Clap each sound in a word, then say it fast.',
    practice: { label: 'Play sound games', to: '/dashboard?tab=progress' },
  },
  {
    id: 'visual',
    name: 'Seeing details',
    short: 'Seeing',
    what: 'Noticing small differences in letters and pictures.',
    tip: 'Use the reading ruler in the Chrome helper to keep your place.',
    practice: { label: 'Play spot-the-difference', to: '/dashboard?tab=progress' },
  },
  {
    id: 'workingMemory',
    name: 'Remembering',
    short: 'Memory',
    what: 'Holding a few things in your head at once.',
    tip: 'Learn in small chunks of 3 or 4 things.',
    practice: { label: 'Play memory games', to: '/dashboard?tab=progress' },
  },
  {
    id: 'processingSpeed',
    name: 'Speed',
    short: 'Speed',
    what: 'How quickly you spot patterns.',
    tip: 'Practise 5 minutes a day. Short and often works best.',
    practice: { label: 'Play pattern games', to: '/dashboard?tab=progress' },
  },
  {
    id: 'orthographic',
    name: 'Spotting words',
    short: 'Words',
    what: 'Knowing a word by its shape and spelling.',
    tip: 'Read the same short text twice. It gets easier.',
    practice: { label: 'Play word games', to: '/dashboard?tab=progress' },
  },
  {
    id: 'executive',
    name: 'Planning & focus',
    short: 'Focus',
    what: 'Planning steps and staying on task.',
    tip: 'Break a task into steps and tick each one off.',
    practice: { label: 'Practice in Game Arena', to: '/dashboard?tab=progress' },
  },
];

export type Band = 'needs' | 'growing' | 'strong';
export const TARGET = 75;

export const bandFor = (score: number): Band => (score < 50 ? 'needs' : score < TARGET ? 'growing' : 'strong');

export const BAND_INFO: Record<Band, { label: string; color: string; soft: string; text: string }> = {
  needs: { label: 'Needs practice', color: '#F59E0B', soft: '#FEF3C7', text: '#92400E' },
  growing: { label: 'Growing', color: '#3B82F6', soft: '#DBEAFE', text: '#1E40AF' },
  strong: { label: 'Strong', color: '#10B981', soft: '#D1FAE5', text: '#065F46' },
};

export interface SkillResult extends SkillMeta {
  score: number; // 0–100, higher = better
  partA?: number;
  partB?: number;
  band: Band;
}

export interface QuestionMetricLike {
  questionId: number;
  selectedOption: number;
  optionChanges?: number;
  audioReplays?: number;
}

export interface MetricsLike {
  totalTime?: number;
  averageTimePerQuestion?: number;
  confusionCount?: number;
  backtrackCount?: number;
  audioReplayCount?: number;
  readingTrackingCount?: number;
  questionMetrics?: QuestionMetricLike[];
}

export type CognitiveProfileLike = Partial<Record<SkillId, number>> | null | undefined;

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function computeSkills(metrics: MetricsLike | undefined, profile: CognitiveProfileLike): SkillResult[] {
  const sums: Partial<Record<SkillId, { total: number; count: number }>> = {};
  for (const qm of metrics?.questionMetrics ?? []) {
    const q = partAQuestions.find((x) => x.id === qm.questionId);
    if (!q || qm.selectedOption == null || qm.selectedOption < 0) continue;
    // Only items that can go right or wrong say something about a skill
    // (a single "Start" button always has weight 0 and would look perfect).
    const weights = new Set(q.options.map((o) => o.weight ?? 0));
    if (weights.size < 2) continue;
    const option = q.options[qm.selectedOption];
    if (!option || typeof option.weight !== 'number') continue;
    const value = ((3 - Math.min(3, Math.max(0, option.weight))) / 3) * 100;
    const slot = (sums[q.dimension] ??= { total: 0, count: 0 });
    slot.total += value;
    slot.count += 1;
  }

  return SKILLS.map((meta) => {
    const a = sums[meta.id];
    const partA = a && a.count ? clamp(a.total / a.count) : undefined;
    const rawB = profile?.[meta.id];
    const partB = typeof rawB === 'number' && Number.isFinite(rawB) ? clamp(rawB) : undefined;
    const parts = [partA, partB].filter((v): v is number => typeof v === 'number');
    const score = parts.length ? clamp(parts.reduce((s, v) => s + v, 0) / parts.length) : 0;
    return { ...meta, partA, partB, score, band: bandFor(score) };
  });
}

/** Lowest skills first; up to three below the target. */
export function focusAreas(skills: SkillResult[]): SkillResult[] {
  const sorted = [...skills].sort((x, y) => x.score - y.score);
  const below = sorted.filter((s) => s.score < TARGET).slice(0, 3);
  return below.length ? below : sorted.slice(0, 1);
}

/** How many skills sit in each band (for the "skills by level" donut). */
export const BAND_ORDER: Band[] = ['strong', 'growing', 'needs'];
export function bandCounts(skills: SkillResult[]): number[] {
  return BAND_ORDER.map((band) => skills.filter((s) => s.band === band).length);
}

export function formatDuration(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds)) return '—';
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  return m ? `${m} min ${s % 60}s` : `${s}s`;
}
