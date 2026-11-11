const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const typescript = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = typescript.transpileModule(source, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2020,
    },
  });
  module._compile(outputText, filename);
};

const { partAQuestions } = require('../src/components/assessment/assessmentQuestions.ts');
const { computeSkills } = require('../src/components/assessment/reportData.ts');
const {
  calculateIndicatorScore,
  calculatePartAPerformance,
  calculatePercentCorrect,
  getAssessmentSeverity,
} = require('../src/utils/assessmentScoring.ts');

const scoredPartAQuestions = partAQuestions.filter(
  question => question.type === 'frequency' || question.correctAnswer !== undefined,
);
const perfectProfile = {
  phonological: 100,
  visual: 100,
  workingMemory: 100,
  processingSpeed: 100,
  orthographic: 100,
  executive: 100,
};
const zeroProfile = Object.fromEntries(
  Object.keys(perfectProfile).map(dimension => [dimension, 0]),
);

test('Part A awards 100 performance for all correct answers and 0 for all incorrect', () => {
  const correct = scoredPartAQuestions.map(question => ({
    questionId: question.id,
    selectedOption: question.correctAnswer,
  }));
  const incorrect = scoredPartAQuestions.map(question => ({
    questionId: question.id,
    selectedOption: question.correctAnswer === 0 ? 1 : 0,
  }));

  assert.equal(calculatePartAPerformance(correct), 100);
  assert.equal(calculatePartAPerformance(incorrect), 0);
});

test('Part A gives half credit when two of its four scored activities are correct', () => {
  const answers = scoredPartAQuestions.map((question, index) => ({
    questionId: question.id,
    selectedOption: index < 2
      ? question.correctAnswer
      : question.correctAnswer === 0 ? 1 : 0,
  }));

  assert.equal(scoredPartAQuestions.length, 4);
  assert.equal(calculatePartAPerformance(answers), 50);
});

test('Part A uses partial completion percentage for Mission Control', () => {
  const answers = scoredPartAQuestions.map(question => ({
    questionId: question.id,
    selectedOption: question.correctAnswer,
    ...(question.type === 'mission_control' ? { performanceScore: 67 } : {}),
  }));

  assert.equal(calculatePartAPerformance(answers), 92);
});

test('unanswered Part A scored items count as incorrect', () => {
  const answers = scoredPartAQuestions.slice(1).map(question => ({
    questionId: question.id,
    selectedOption: question.correctAnswer,
  }));

  assert.equal(calculatePartAPerformance(answers), 75);
  assert.equal(calculatePartAPerformance([]), 0);
});

test('report skill scores include unanswered Part A activities as zero', () => {
  const skills = computeSkills({ questionMetrics: [] }, null);
  assert.equal(skills.find(skill => skill.id === 'phonological').partA, 0);
  assert.equal(skills.find(skill => skill.id === 'visual').partA, 0);
  assert.equal(skills.find(skill => skill.id === 'workingMemory').partA, 0);
});

test('Part B question percentages handle partial, zero, and perfect results', () => {
  assert.equal(calculatePercentCorrect(2, 4), 50);
  assert.equal(calculatePercentCorrect(0, 4), 0);
  assert.equal(calculatePercentCorrect(4, 4), 100);
  assert.throws(() => calculatePercentCorrect(5, 4), RangeError);
  assert.throws(() => calculatePercentCorrect(0, 0), RangeError);
});

test('overall indicator combines Part A and the equal-weight average of six Part B tasks', () => {
  assert.equal(calculateIndicatorScore(100, perfectProfile), 0);
  assert.equal(calculateIndicatorScore(0, zeroProfile), 100);
  assert.equal(calculateIndicatorScore(0, perfectProfile), 50);
  assert.equal(calculateIndicatorScore(50, Object.fromEntries(
    Object.keys(perfectProfile).map(dimension => [dimension, 50]),
  )), 50);

  const onePartBTaskAtHalf = { ...perfectProfile, processingSpeed: 50 };
  assert.equal(calculateIndicatorScore(100, onePartBTaskAtHalf), 4);
});

test('out-of-range or empty Part B profiles are rejected', () => {
  assert.throws(() => calculateIndicatorScore(100, { ...perfectProfile, visual: 101 }), /between 0 and 100/);
  assert.throws(() => calculateIndicatorScore(100, {}), /At least one/);
  assert.throws(() => calculateIndicatorScore(101, perfectProfile), RangeError);
});

test('a cognitive task that could not be measured is left out of the Part B average', () => {
  // Time Reading (executive) missing, e.g. no microphone: average the other five
  const fiveAt60 = { phonological: 60, visual: 60, workingMemory: 60, processingSpeed: 60, orthographic: 60 };
  // Part A 100, Part B 60 → average 80 → indicator 20
  assert.equal(calculateIndicatorScore(100, fiveAt60), 20);
  // Counting it as 0 instead would have given a very different result
  assert.equal(calculateIndicatorScore(100, { ...fiveAt60, executive: 0 }), 25);

  // The report skips it too, instead of showing 0
  const skills = computeSkills({ questionMetrics: [] }, fiveAt60);
  assert.equal(skills.find(skill => skill.id === 'executive').partB, undefined);
});

test('severity bands include the exact boundary values', () => {
  assert.deepEqual(
    [0, 19, 20, 39, 40, 59, 60, 100].map(getAssessmentSeverity),
    ['none', 'none', 'mild', 'mild', 'moderate', 'moderate', 'severe', 'severe'],
  );
});

test('read-aloud score is 70% accuracy + 30% speed, counting only words read', () => {
  const { calculateReadAloudScore } = require('../src/utils/assessmentScoring.ts');
  const perfect = calculateReadAloudScore({ correctWords: 24, wrongWords: 0, totalWords: 24, readingTimeSec: 14 });
  assert.deepEqual(perfect, { score: 100, accuracyPct: 100, wordsPerMinute: 103 });

  const twoMistakes = calculateReadAloudScore({ correctWords: 22, wrongWords: 2, totalWords: 24, readingTimeSec: 14 });
  assert.equal(twoMistakes.accuracyPct, 92);
  assert.equal(twoMistakes.score, 94);

  const slow = calculateReadAloudScore({ correctWords: 24, wrongWords: 0, totalWords: 24, readingTimeSec: 50 });
  assert.equal(slow.score, 70); // full accuracy, below the zero-marks speed

  const stoppedEarly = calculateReadAloudScore({ correctWords: 12, wrongWords: 0, totalWords: 24, readingTimeSec: 8 });
  assert.equal(stoppedEarly.wordsPerMinute, 90);
  assert.equal(stoppedEarly.accuracyPct, 50);
});

test('read-aloud question is left out when the microphone heard nothing', () => {
  const { calculateReadAloudScore } = require('../src/utils/assessmentScoring.ts');
  assert.equal(calculateReadAloudScore({ correctWords: 0, wrongWords: 0, totalWords: 24, readingTimeSec: 10 }), null);

  const readAloud = partAQuestions.find(question => question.type === 'reading_reread_tracking');
  const others = scoredPartAQuestions.map(question => ({
    questionId: question.id,
    selectedOption: question.type === 'frequency' ? question.options.findIndex(o => o.weight === 0) : question.correctAnswer,
  }));
  // Nothing heard: average of the other questions only
  assert.equal(calculatePartAPerformance([...others, { questionId: readAloud.id, selectedOption: 0 }]), 100);
  // Heard and scored: it counts like any other question
  assert.equal(
    calculatePartAPerformance([...others, { questionId: readAloud.id, selectedOption: 0, performanceScore: 40 }]),
    Math.round((100 * others.length + 40) / (others.length + 1)),
  );
});

test('number puzzles, letters and read-aloud tasks score from what they measured', () => {
  const { scorePuzzleTask, scoreLetterTask, scoreWordsReadTask, scoreRoundsTask } = require('../src/utils/assessmentScoring.ts');

  assert.equal(scorePuzzleTask([{ is_correct: true }, { is_correct: false }, { is_correct: true }, { is_correct: true }]), 75);
  assert.equal(scorePuzzleTask([]), null);

  // 3 of 3 + 2 of 4 letters in order = 5 of 7; a round where nothing was heard is ignored
  assert.equal(
    scoreLetterTask([
      { transcript: 'f g h', matched: 3, expected: ['f', 'g', 'h'] },
      { transcript: 'm n', matched: 2, expected: ['m', 'n', 'o', 'p'] },
      { transcript: '', matched: 0, expected: ['c', 'd'] },
    ]),
    71,
  );
  assert.equal(scoreLetterTask([{ transcript: '', matched: 0, expected: ['c', 'd'] }]), null);

  assert.equal(scoreWordsReadTask({ words_read: 18, words_total: 24, heard: true }), 75);
  assert.equal(scoreWordsReadTask({ words_read: 0, words_total: 24, heard: false }), null);
  assert.equal(scoreWordsReadTask({ words_read: 0, words_total: 24, heard: false, skipped: true }), null);

  // Left/right game: partial credit instead of pass/fail
  assert.equal(scoreRoundsTask(3, 5), 60);
  assert.equal(scoreRoundsTask(5, 5), 100);
});

test('questions that could not be measured are left out, not counted as wrong', () => {
  const handRaising = partAQuestions.find(question => question.type === 'hand_raising');
  const others = scoredPartAQuestions
    .filter(question => question.id !== handRaising.id)
    .map(question => ({
      questionId: question.id,
      selectedOption: question.type === 'frequency' ? question.options.findIndex(o => o.weight === 0) : question.correctAnswer,
    }));
  assert.equal(calculatePartAPerformance([...others, { questionId: handRaising.id, selectedOption: 0, skipped: true }]), 100);
  assert.equal(
    calculatePartAPerformance([...others, { questionId: handRaising.id, selectedOption: 1 }]),
    Math.round((100 * others.length) / (others.length + 1)),
  );

  // Report skills follow the same rule
  const skills = computeSkills({ questionMetrics: [...others, { questionId: handRaising.id, selectedOption: 0, skipped: true }] }, null);
  const visual = skills.find(skill => skill.id === handRaising.dimension);
  assert.equal(visual.partA, 100);
});

test('every Part A activity with a measurable result now counts toward the score', () => {
  const { isScoredQuestion } = require('../src/utils/assessmentScoring.ts');
  const counted = partAQuestions.filter(isScoredQuestion).map(question => question.type).sort();
  assert.deepEqual(counted, [
    'camera_direction',
    'hand_raising',
    'mission_control',
    'multiplication_recall',
    'object_naming',
    'read_aloud',
    'reading_reread_tracking',
    'voice_alphabet',
  ]);
});
