"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptivePracticeRouter = void 0;
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../auth");
const AdaptivePracticeRun_1 = __importDefault(require("../models/AdaptivePracticeRun"));
const adaptiveLearnerService_1 = require("../services/adaptiveLearnerService");
const adaptiveQuestionModel_1 = require("../services/adaptiveQuestionModel");
exports.adaptivePracticeRouter = (0, express_1.Router)();
function isAdaptiveSkill(value) {
    return value === 'sound' || value === 'focus' || value === 'memory' || value === 'speed';
}
function userId(req) {
    return String(req.user.userId);
}
function publicRun(run) {
    const completed = run.status === 'complete';
    const currentQuestion = completed ? undefined : run.questions[run.responses.length];
    const reviewQuestions = completed
        ? run.responses
            .filter(response => !response.correct)
            .map(response => {
            const question = run.questions.find(item => item.id === response.questionId);
            return {
                prompt: question.prompt,
                options: question.options,
                correctAnswer: question.answer,
                selectedOption: response.selectedOption,
            };
        })
        : undefined;
    return {
        runId: run._id.toString(),
        skill: run.skill,
        status: run.status,
        question: currentQuestion
            ? { index: run.responses.length, total: run.questionLimit, prompt: currentQuestion.prompt, options: currentQuestion.options }
            : null,
        result: completed
            ? { correct: run.responses.filter(response => response.correct).length, total: run.questionLimit }
            : null,
        reviewQuestions,
    };
}
exports.adaptivePracticeRouter.post('/start', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const skill = req.body?.skill;
        if (!isAdaptiveSkill(skill))
            return res.status(400).json({ error: 'A valid skill is required' });
        const currentUser = userId(req);
        const learner = await (0, adaptiveLearnerService_1.getAdaptiveLearner)(currentUser, skill);
        const question = (0, adaptiveQuestionModel_1.selectAdaptiveQuestion)(skill, learner.ability, new Set(learner.seenQuestionIds));
        await AdaptivePracticeRun_1.default.updateMany({ userId: currentUser, skill, status: 'active' }, { $set: { status: 'abandoned' } });
        const run = await AdaptivePracticeRun_1.default.create({
            userId: currentUser,
            skill,
            status: 'active',
            questions: [question],
            responses: [],
            ability: learner.ability,
            questionLimit: adaptiveQuestionModel_1.PRACTICE_QUESTION_COUNT,
        });
        await (0, adaptiveLearnerService_1.markAdaptiveQuestionSeen)(currentUser, skill, question.id);
        res.status(201).json(publicRun(run));
    }
    catch (error) {
        console.error('Adaptive practice start error:', error);
        res.status(500).json({ error: 'Could not start adaptive practice' });
    }
});
exports.adaptivePracticeRouter.get('/:runId', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.runId)) {
            return res.status(400).json({ error: 'Invalid practice run ID' });
        }
        const run = await AdaptivePracticeRun_1.default.findOne({ _id: req.params.runId, userId: userId(req) });
        if (!run)
            return res.status(404).json({ error: 'Practice run not found' });
        res.json(publicRun(run));
    }
    catch (error) {
        console.error('Adaptive practice load error:', error);
        res.status(500).json({ error: 'Could not load adaptive practice' });
    }
});
exports.adaptivePracticeRouter.post('/:runId/answer', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.runId)) {
            return res.status(400).json({ error: 'Invalid practice run ID' });
        }
        const { answer, questionIndex } = req.body || {};
        if (!Number.isInteger(answer) || answer < 0 || answer > 3 || !Number.isInteger(questionIndex) || questionIndex < 0) {
            return res.status(400).json({ error: 'Choose a valid answer option' });
        }
        const run = await AdaptivePracticeRun_1.default.findOne({ _id: req.params.runId, userId: userId(req) });
        if (!run)
            return res.status(404).json({ error: 'Practice run not found' });
        if (questionIndex < run.responses.length)
            return res.json(publicRun(run));
        if (questionIndex > run.responses.length)
            return res.status(409).json({ error: 'Answer the current question before continuing' });
        if (run.status !== 'active')
            return res.status(409).json({ error: 'This practice run is no longer active' });
        const question = run.questions[run.responses.length];
        if (!question)
            return res.status(409).json({ error: 'The current question is unavailable' });
        const correct = answer === question.answer;
        run.responses.push({ questionId: question.id, selectedOption: answer, correct });
        await (0, adaptiveLearnerService_1.recordAdaptiveAnswer)(userId(req), run.skill, question.id, question.difficulty, correct);
        const learner = await (0, adaptiveLearnerService_1.getAdaptiveLearner)(userId(req), run.skill);
        run.ability = learner.ability;
        if (run.responses.length >= run.questionLimit) {
            run.status = 'complete';
        }
        else {
            const currentQuestionIds = new Set(run.questions.map(item => item.id));
            const nextQuestion = (0, adaptiveQuestionModel_1.selectAdaptiveQuestion)(run.skill, run.ability, new Set(learner.seenQuestionIds), currentQuestionIds);
            run.questions.push(nextQuestion);
            await (0, adaptiveLearnerService_1.markAdaptiveQuestionSeen)(userId(req), run.skill, nextQuestion.id);
        }
        await run.save();
        res.json(publicRun(run));
    }
    catch (error) {
        console.error('Adaptive practice answer error:', error);
        res.status(500).json({ error: 'Could not save your answer' });
    }
});
