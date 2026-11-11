import { partAQuestions } from '../components/assessment/assessmentQuestions';

export type AssessmentSeverity = 'none' | 'mild' | 'moderate' | 'severe';
export type CognitiveDimension =
  | 'phonological'
  | 'visual'
  | 'workingMemory'
  | 'processingSpeed'
  | 'orthographic'
  | 'executive';
export type CognitiveProfile = Record<CognitiveDimension, number>;
/** Cognitive scores actually measured; a task that couldn't run (e.g. no mic) is missing. */
export type MeasuredCognitiveProfile = Partial<CognitiveProfile>;

type QuestionMetric = {
  questionId: number;
  selectedOption: number;
  performanceScore?: number;
  /** Couldn't be measured (camera/mic unavailable, or skipped): left out of the score */
  skipped?: boolean;
};

export function calculatePercentCorrect(correct: number, total: number): number {
  if (!Number.isInteger(correct) || !Number.isInteger(total) || total <= 0 || correct < 0 || correct > total) {
    throw new RangeError('Correct and total must be valid non-negative question counts.');
  }
  return Math.round((correct / total) * 100);
}

/**
 * Activities with no single answer option: their score is a 0–100 performance
 * measured by the task itself (words read, puzzles solved, letters said).
 * With no measurement they are left out rather than counted as wrong.
 */
const PERFORMANCE_ONLY_TYPES = new Set(['reading_reread_tracking', 'multiplication_recall', 'voice_alphabet', 'read_aloud']);

type ScorableQuestion = (typeof partAQuestions)[number];

/** Questions that count toward the score. */
export function isScoredQuestion(question: ScorableQuestion): boolean {
  return (
    question.type === 'frequency' ||
    PERFORMANCE_ONLY_TYPES.has(question.type) ||
    question.correctAnswer !== undefined
  );
}

const validPerformance = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;

/**
 * Score (0–100) for one question, or null when it should be left out
 * (a read-aloud question where the microphone heard nothing).
 */
export function scoreQuestion(
  question: ScorableQuestion,
  response: { selectedOption: number; performanceScore?: number; skipped?: boolean } | undefined,
): number | null {
  if (response?.skipped) return null;
  if (PERFORMANCE_ONLY_TYPES.has(question.type)) {
    return validPerformance(response?.performanceScore) ? response!.performanceScore! : null;
  }
  if (
    !response ||
    !Number.isInteger(response.selectedOption) ||
    response.selectedOption < 0 ||
    response.selectedOption >= question.options.length
  ) {
    return 0;
  }
  if (validPerformance(response.performanceScore)) return response.performanceScore;
  if (question.type === 'frequency') {
    const weight = question.options[response.selectedOption].weight;
    return typeof weight === 'number' ? ((3 - Math.min(3, Math.max(0, weight))) / 3) * 100 : 0;
  }
  return response.selectedOption === question.correctAnswer ? 100 : 0;
}

export function calculatePartAPerformance(questionMetrics: QuestionMetric[]): number {
  const responses = partAQuestions
    .filter(isScoredQuestion)
    .map(question => scoreQuestion(question, questionMetrics.find(metric => metric.questionId === question.id)))
    .filter((score): score is number => score !== null);
  if (responses.length === 0) return 0;
  return Math.round(responses.reduce((total, response) => total + response, 0) / responses.length);
}

/** Reading speed that earns full / zero marks on the read-aloud question (words per minute). */
export const READ_ALOUD_FULL_WPM = 100;
export const READ_ALOUD_ZERO_WPM = 30;

export interface ReadAloudResult {
  score: number;
  accuracyPct: number;
  wordsPerMinute: number;
}

/**
 * Read-aloud question score: 70% accuracy (words read correctly out of all
 * words) + 30% speed. Returns null when the microphone heard no words, so a
 * browser without speech recognition is not counted as a failed answer.
 */
export function calculateReadAloudScore(input: {
  correctWords: number;
  wrongWords: number;
  totalWords: number;
  readingTimeSec: number;
}): ReadAloudResult | null {
  const { correctWords, wrongWords, totalWords, readingTimeSec } = input;
  if (!(totalWords > 0) || !(correctWords >= 0) || !(wrongWords >= 0)) return null;
  if (correctWords + wrongWords === 0) return null;
  const accuracyPct = Math.min(100, (correctWords / totalWords) * 100);
  const minutes = Math.max(readingTimeSec, 1) / 60;
  // Speed counts only the words actually read, so stopping early isn't "fast"
  const wordsPerMinute = (correctWords + wrongWords) / minutes;
  const speedPct = Math.min(
    100,
    Math.max(0, ((wordsPerMinute - READ_ALOUD_ZERO_WPM) / (READ_ALOUD_FULL_WPM - READ_ALOUD_ZERO_WPM)) * 100),
  );
  return {
    score: Math.round(0.7 * accuracyPct + 0.3 * speedPct),
    accuracyPct: Math.round(accuracyPct),
    wordsPerMinute: Math.round(wordsPerMinute),
  };
}

export function calculateIndicatorScore(
  partAPerformance: number,
  cognitiveProfile: Partial<CognitiveProfile>,
): number {
  const dimensions: CognitiveDimension[] = [
    'phonological',
    'visual',
    'workingMemory',
    'processingSpeed',
    'orthographic',
    'executive',
  ];
  // A task that couldn't be measured is simply missing; present scores must be valid
  const presentScores = dimensions
    .map(dimension => cognitiveProfile[dimension])
    .filter(score => score !== undefined && score !== null);
  const validCognitiveScores = presentScores.filter(
    (score): score is number =>
      typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100,
  );
  if (validCognitiveScores.length !== presentScores.length) {
    throw new Error('Cognitive task scores must be between 0 and 100.');
  }
  if (validCognitiveScores.length === 0) {
    throw new Error('At least one cognitive task score is required.');
  }

  if (!Number.isFinite(partAPerformance) || partAPerformance < 0 || partAPerformance > 100) {
    throw new RangeError('Part A performance must be between 0 and 100.');
  }

  const cognitiveAverage =
    validCognitiveScores.reduce((total, score) => total + score, 0) / validCognitiveScores.length;
  const sectionScores = [partAPerformance, cognitiveAverage];
  const averagePerformance = sectionScores.reduce((total, score) => total + score, 0) / sectionScores.length;
  return Math.round(100 - averagePerformance);
}

export function getAssessmentSeverity(indicatorScore: number): AssessmentSeverity {
  if (!Number.isFinite(indicatorScore) || indicatorScore < 0 || indicatorScore > 100) {
    throw new RangeError('Assessment indicator score must be between 0 and 100.');
  }
  if (indicatorScore < 20) return 'none';
  if (indicatorScore < 40) return 'mild';
  if (indicatorScore < 60) return 'moderate';
  return 'severe';
}

export function getAssessmentClassification(indicatorScore: number): string {
  const severity = getAssessmentSeverity(indicatorScore);
  const labels: Record<AssessmentSeverity, string> = {
    none: 'Low support indicators',
    mild: 'Mild support indicators',
    moderate: 'Moderate support indicators',
    severe: 'High support indicators',
  };
  return labels[severity];
}

/** Number puzzles: % answered correctly, or null if none were answered. */
export function scorePuzzleTask(results: { is_correct: boolean }[]): number | null {
  if (!results.length) return null;
  return calculatePercentCorrect(results.filter(r => r.is_correct).length, results.length);
}

/**
 * Say-the-letters task: letters said in the right order out of all expected,
 * counting only rounds where the microphone heard something.
 */
export function scoreLetterTask(
  rounds: { transcript?: string; matched?: number; expected?: string[] }[],
): number | null {
  const heard = rounds.filter(r => (r.transcript ?? '').trim() && r.expected?.length);
  if (!heard.length) return null;
  const expected = heard.reduce((n, r) => n + (r.expected?.length ?? 0), 0);
  const matched = heard.reduce((n, r) => n + Math.min(r.matched ?? 0, r.expected?.length ?? 0), 0);
  return Math.round((matched / expected) * 100);
}

/** Read-aloud task: words read correctly out of all words, or null if skipped / nothing heard. */
export function scoreWordsReadTask(result: {
  words_read?: number;
  words_total?: number;
  heard?: boolean;
  skipped?: boolean;
}): number | null {
  if (result.skipped || !result.heard || !(result.words_total && result.words_total > 0)) return null;
  return Math.round((Math.min(result.words_read ?? 0, result.words_total) / result.words_total) * 100);
}

/** Left/right game: % of rounds right (partial credit). */
export function scoreRoundsTask(correct: number, total: number): number {
  return total > 0 ? calculatePercentCorrect(Math.min(correct, total), total) : 0;
}
