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

test('incomplete or out-of-range Part B profiles are rejected', () => {
  assert.throws(() => calculateIndicatorScore(100, { ...perfectProfile, executive: undefined }), /All six/);
  assert.throws(() => calculateIndicatorScore(100, { ...perfectProfile, visual: 101 }), /All six/);
  assert.throws(() => calculateIndicatorScore(101, perfectProfile), RangeError);
});

test('severity bands include the exact boundary values', () => {
  assert.deepEqual(
    [0, 19, 20, 39, 40, 59, 60, 100].map(getAssessmentSeverity),
    ['none', 'none', 'mild', 'mild', 'moderate', 'moderate', 'severe', 'severe'],
  );
});
