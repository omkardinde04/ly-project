"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdaptiveLearner = getAdaptiveLearner;
exports.recordAdaptiveAnswer = recordAdaptiveAnswer;
exports.markAdaptiveQuestionSeen = markAdaptiveQuestionSeen;
const AdaptiveLearner_1 = __importDefault(require("../models/AdaptiveLearner"));
const LearningProgress_1 = __importDefault(require("../models/LearningProgress"));
const adaptiveQuestionModel_1 = require("./adaptiveQuestionModel");
async function getAdaptiveLearner(userId, skill) {
    const existing = await AdaptiveLearner_1.default.findOne({ userId, skill });
    if (existing)
        return existing;
    const progress = await LearningProgress_1.default.findOne({ userId });
    const stats = progress?.skills?.[skill];
    const recentAccuracies = (progress?.recentActivity || [])
        .filter(activity => activity.skill === skill)
        .slice(0, 5)
        .map(activity => activity.accuracy / 100);
    const initialAbility = recentAccuracies.length
        ? 1 + recentAccuracies.reduce((sum, accuracy) => sum + accuracy, 0) / recentAccuracies.length * 3
        : stats && stats.attempts > 0
            ? stats.difficulty
            : adaptiveQuestionModel_1.DEFAULT_ABILITY;
    try {
        return await AdaptiveLearner_1.default.create({
            userId,
            skill,
            ability: Math.max(1, Math.min(4, initialAbility)),
            seenQuestionIds: [],
        });
    }
    catch (error) {
        if (error.code !== 11000)
            throw error;
        const createdByAnotherRequest = await AdaptiveLearner_1.default.findOne({ userId, skill });
        if (!createdByAnotherRequest)
            throw error;
        return createdByAnotherRequest;
    }
}
async function recordAdaptiveAnswer(userId, skill, questionId, difficulty, correct) {
    const learner = await getAdaptiveLearner(userId, skill);
    learner.ability = (0, adaptiveQuestionModel_1.updateAbility)(learner.ability, correct, difficulty);
    if (!learner.seenQuestionIds.includes(questionId)) {
        learner.seenQuestionIds.push(questionId);
    }
    await learner.save();
}
async function markAdaptiveQuestionSeen(userId, skill, questionId) {
    const learner = await getAdaptiveLearner(userId, skill);
    if (learner.seenQuestionIds.includes(questionId))
        return;
    learner.seenQuestionIds.push(questionId);
    await learner.save();
}
