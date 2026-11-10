import AdaptiveLearner, { IAdaptiveLearner } from '../models/AdaptiveLearner';
import LearningProgress from '../models/LearningProgress';
import {
  AdaptiveSkill,
  DEFAULT_ABILITY,
  updateAbility,
} from './adaptiveQuestionModel';

export async function getAdaptiveLearner(userId: string, skill: AdaptiveSkill): Promise<IAdaptiveLearner> {
  const existing = await AdaptiveLearner.findOne({ userId, skill });
  if (existing) return existing;

  const progress = await LearningProgress.findOne({ userId });
  const stats = progress?.skills?.[skill];
  const recentAccuracies = (progress?.recentActivity || [])
    .filter(activity => activity.skill === skill)
    .slice(0, 5)
    .map(activity => activity.accuracy / 100);
  const initialAbility = recentAccuracies.length
    ? 1 + recentAccuracies.reduce((sum, accuracy) => sum + accuracy, 0) / recentAccuracies.length * 3
    : stats && stats.attempts > 0
      ? stats.difficulty
      : DEFAULT_ABILITY;

  try {
    return await AdaptiveLearner.create({
      userId,
      skill,
      ability: Math.max(1, Math.min(4, initialAbility)),
      seenQuestionIds: [],
    });
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    const createdByAnotherRequest = await AdaptiveLearner.findOne({ userId, skill });
    if (!createdByAnotherRequest) throw error;
    return createdByAnotherRequest;
  }
}

export async function recordAdaptiveAnswer(
  userId: string,
  skill: AdaptiveSkill,
  questionId: string,
  difficulty: number,
  correct: boolean,
): Promise<void> {
  const learner = await getAdaptiveLearner(userId, skill);
  learner.ability = updateAbility(learner.ability, correct, difficulty);
  if (!learner.seenQuestionIds.includes(questionId)) {
    learner.seenQuestionIds.push(questionId);
  }
  await learner.save();
}

export async function markAdaptiveQuestionSeen(
  userId: string,
  skill: AdaptiveSkill,
  questionId: string,
): Promise<void> {
  const learner = await getAdaptiveLearner(userId, skill);
  if (learner.seenQuestionIds.includes(questionId)) return;
  learner.seenQuestionIds.push(questionId);
  await learner.save();
}
