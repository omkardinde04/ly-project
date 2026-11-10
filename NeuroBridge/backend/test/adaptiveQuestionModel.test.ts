import assert from 'node:assert/strict';
import {
  adaptiveQuestionBank,
  PRACTICE_QUESTION_COUNT,
  selectAdaptiveQuestion,
  updateAbility,
} from '../src/services/adaptiveQuestionModel';

const skills = ['sound', 'focus', 'memory', 'speed'] as const;
const questionIds = adaptiveQuestionBank.map(question => question.id);

assert.equal(new Set(questionIds).size, questionIds.length, 'question IDs must be unique');

for (const skill of skills) {
  const questions = adaptiveQuestionBank.filter(question => question.skill === skill);
  assert.equal(questions.length, 16, `${skill} should have enough variants for fresh tests`);
  assert(questions.every(question => question.answer >= 0 && question.answer < question.options.length));
  assert(questions.every(question => question.difficulty >= 1 && question.difficulty <= 4));
  assert.equal(selectAdaptiveQuestion(skill, 1, new Set()).difficulty, 1);
  assert.equal(selectAdaptiveQuestion(skill, 4, new Set()).difficulty, 4);

  const served = new Set<string>();
  let ability = 2.5;
  for (let session = 0; session < 2; session += 1) {
    const sessionIds = new Set<string>();
    for (let index = 0; index < PRACTICE_QUESTION_COUNT; index += 1) {
      const question = selectAdaptiveQuestion(skill, ability, served, sessionIds);
      assert(!sessionIds.has(question.id), `${skill} test should not repeat a question within the test`);
      assert(!served.has(question.id), `${skill} should avoid questions from the previous test`);
      sessionIds.add(question.id);
      served.add(question.id);
      ability = updateAbility(ability, index % 2 === 0, question.difficulty);
    }
    assert.equal(sessionIds.size, PRACTICE_QUESTION_COUNT);
  }
  assert.equal(served.size, PRACTICE_QUESTION_COUNT * 2);
}

const correctAbility = updateAbility(2.5, true, 2);
const incorrectAbility = updateAbility(2.5, false, 2);
assert(correctAbility > 2.5, 'a correct answer should increase ability');
assert(incorrectAbility < 2.5, 'an incorrect answer should reduce ability');
const correctAfterTargetQuestion = updateAbility(2.5, true, 3);
const incorrectAfterTargetQuestion = updateAbility(2.5, false, 3);
assert.equal(selectAdaptiveQuestion('focus', correctAfterTargetQuestion, new Set()).difficulty, 3);
assert.equal(selectAdaptiveQuestion('focus', incorrectAfterTargetQuestion, new Set()).difficulty, 2);
assert.equal(updateAbility(4, true, 1), 4, 'ability must stay within the supported range');
assert.equal(updateAbility(1, false, 4), 1, 'ability must stay within the supported range');
assert.equal(adaptiveQuestionBank.find(question => question.id === 'focus-letter-1')?.answer, 2);

const soundIds = adaptiveQuestionBank.filter(question => question.skill === 'sound').map(question => question.id);
const avoided = new Set(soundIds.slice(0, 8));
const allSeen = new Set(soundIds);
const fallbackQuestion = selectAdaptiveQuestion('sound', 2, allSeen, avoided);
assert(!avoided.has(fallbackQuestion.id), 'fallback selection must not repeat a question in the same test');

console.log('Adaptive question model checks passed.');
