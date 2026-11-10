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

type QuestionMetric = {
  questionId: number;
  selectedOption: number;
  performanceScore?: number;
};

export function calculatePercentCorrect(correct: number, total: number): number {
  if (!Number.isInteger(correct) || !Number.isInteger(total) || total <= 0 || correct < 0 || correct > total) {
    throw new RangeError('Correct and total must be valid non-negative question counts.');
  }
  return Math.round((correct / total) * 100);
}

export function calculatePartAPerformance(questionMetrics: QuestionMetric[]): number {
  const scoredQuestions = partAQuestions.filter(
    question => question.type === 'frequency' || question.correctAnswer !== undefined,
  );
  if (scoredQuestions.length === 0) return 0;

  const responses = scoredQuestions.map(question => {
    const response = questionMetrics.find(metric => metric.questionId === question.id);
    if (
      !response ||
      !Number.isInteger(response.selectedOption) ||
      response.selectedOption < 0 ||
      response.selectedOption >= question.options.length
    ) {
      return 0;
    }

    if (
      typeof response.performanceScore === 'number' &&
      Number.isFinite(response.performanceScore) &&
      response.performanceScore >= 0 &&
      response.performanceScore <= 100
    ) {
      return response.performanceScore;
    }

    if (question.type === 'frequency') {
      const weight = question.options[response.selectedOption].weight;
      return typeof weight === 'number' ? ((3 - Math.min(3, Math.max(0, weight))) / 3) * 100 : 0;
    }

    return response.selectedOption === question.correctAnswer ? 100 : 0;
  });

  return Math.round(responses.reduce((total, response) => total + response, 0) / responses.length);
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
  const cognitiveScores = dimensions.map(dimension => cognitiveProfile[dimension]);
  const validCognitiveScores = cognitiveScores.filter(
    (score): score is number =>
      typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100,
  );
  if (validCognitiveScores.length !== dimensions.length) {
    throw new Error('All six cognitive task scores must be between 0 and 100.');
  }

  if (!Number.isFinite(partAPerformance) || partAPerformance < 0 || partAPerformance > 100) {
    throw new RangeError('Part A performance must be between 0 and 100.');
  }

  const cognitiveAverage =
    validCognitiveScores.reduce((total, score) => total + score, 0) / dimensions.length;
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
