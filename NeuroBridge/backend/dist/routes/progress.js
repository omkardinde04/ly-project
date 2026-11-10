"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressRouter = void 0;
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../auth");
const LearningProgress_1 = __importDefault(require("../models/LearningProgress"));
const Matchmaking_1 = __importDefault(require("../models/Matchmaking"));
const Battle_1 = __importDefault(require("../models/Battle"));
const AdaptiveLearner_1 = __importDefault(require("../models/AdaptiveLearner"));
const adaptiveLearnerService_1 = require("../services/adaptiveLearnerService");
const adaptiveQuestionModel_1 = require("../services/adaptiveQuestionModel");
exports.progressRouter = (0, express_1.Router)();
const skills = ['sound', 'focus', 'memory', 'speed'];
const dayKey = () => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date());
    const part = (type) => parts.find(item => item.type === type).value;
    return `${part('year')}-${part('month')}-${part('day')}`;
};
const userId = (req) => String(req.user.userId);
function validSkill(value) { return typeof value === 'string' && skills.includes(value); }
function updateStreak(progress, today) {
    if (progress.lastPlayedDay === today)
        return progress.streak;
    if (!progress.lastPlayedDay)
        return 1;
    const previous = new Date(`${progress.lastPlayedDay}T00:00:00Z`).getTime();
    const current = new Date(`${today}T00:00:00Z`).getTime();
    return current - previous === 86400000 ? progress.streak + 1 : 1;
}
function recordActivity(progress, today) {
    progress.completedChallenges += 1;
    progress.streak = updateStreak(progress, today);
    progress.lastPlayedDay = today;
    if (!progress.activityDays.includes(today))
        progress.activityDays.push(today);
}
function achievements(progress) {
    const unlocked = new Set(progress.achievements || []);
    if (progress.completedChallenges >= 1)
        unlocked.add('first-step');
    if (progress.streak >= 1)
        unlocked.add('one-day-streak');
    if (progress.skills.sound.attempts >= 10)
        unlocked.add('sound-hunter');
    if (progress.skills.focus.attempts >= 20)
        unlocked.add('focus-finder');
    if (progress.skills.speed.bestAccuracy >= 80)
        unlocked.add('speedster');
    if (progress.streak >= 7)
        unlocked.add('on-a-roll');
    if (progress.skills.memory.bestAccuracy >= 80 && progress.skills.memory.attempts >= 5)
        unlocked.add('memory-master');
    if (Object.values(progress.skills).some((skill) => skill.bestScore > 0 && skill.rating >= 800))
        unlocked.add('personal-best');
    return [...unlocked];
}
function publicBattle(battle, currentUser) {
    const player = battle.players.find(item => item.userId === currentUser);
    const opponent = battle.players.find(item => item.userId !== currentUser);
    const currentQuestionIndex = Math.min(...battle.players.map(item => item.index));
    const waitingForOpponent = player.index > currentQuestionIndex;
    return {
        matchId: battle.matchId, skill: battle.skill, status: battle.status, total: battle.questionLimit, startedAt: battle.startedAt, endsAt: new Date(battle.startedAt.getTime() + 120000),
        question: battle.status === 'active' && !waitingForOpponent && currentQuestionIndex < battle.questions.length
            ? { index: currentQuestionIndex, total: battle.questionLimit, prompt: battle.questions[currentQuestionIndex].prompt, options: battle.questions[currentQuestionIndex].options }
            : null,
        waitingForOpponent,
        you: { name: player.displayName, rating: player.rating, correct: battle.status === 'complete' ? player.correct : null, index: player.index, finishedAt: player.finishedAt },
        opponent: { name: opponent.displayName, rating: opponent.rating, correct: battle.status === 'complete' ? opponent.correct : null, index: opponent.index, finishedAt: opponent.finishedAt },
        result: battle.status === 'complete' ? { winnerId: battle.players.find(item => item.ratingChange === 25)?.userId || null, yourRating: player.rating, opponentRating: opponent.rating, yourRatingChange: player.ratingChange || 0, opponentRatingChange: opponent.ratingChange || 0 } : null,
    };
}
async function completeBattle(battle) {
    if (battle.status === 'complete')
        return battle;
    const timeExpired = Date.now() >= battle.startedAt.getTime() + 120000;
    const bothFinished = battle.players.every(player => player.index >= battle.questionLimit);
    if (!timeExpired && !bothFinished)
        return battle;
    const [first, second] = battle.players;
    if (first.correct !== second.correct) {
        const winner = first.correct > second.correct ? first : second;
        const loser = first.correct > second.correct ? second : first;
        winner.ratingChange = 25;
        loser.ratingChange = -25;
    }
    else {
        first.ratingChange = 0;
        second.ratingChange = 0;
    }
    const completedBattle = await Battle_1.default.findOneAndUpdate({ _id: battle._id, status: battle.status }, { $set: { status: 'complete', completedAt: new Date(), players: battle.players } }, { new: true });
    if (!completedBattle)
        return (await Battle_1.default.findById(battle._id)) || battle;
    const activityDay = dayKey();
    for (const player of completedBattle.players) {
        const progress = await LearningProgress_1.default.findOneAndUpdate({ userId: player.userId }, { $setOnInsert: { userId: player.userId } }, { new: true, upsert: true, setDefaultsOnInsert: true });
        const skillStats = progress.skills[completedBattle.skill];
        const ratingChange = player.ratingChange === 25 ? 25 : player.ratingChange === 0 ? 0 : -Math.min(25, skillStats.rating);
        skillStats.rating = Math.max(0, skillStats.rating + ratingChange);
        player.ratingChange = ratingChange;
        player.rating = skillStats.rating;
        recordActivity(progress, activityDay);
        await progress.save();
    }
    await completedBattle.save();
    return completedBattle;
}
exports.progressRouter.get('/', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const currentUser = userId(req);
        const progress = await LearningProgress_1.default.findOneAndUpdate({ userId: currentUser }, { $setOnInsert: { userId: currentUser } }, { new: true, upsert: true, setDefaultsOnInsert: true });
        for (const skill of ['sound', 'focus', 'memory', 'speed']) {
            if (progress.skills[skill].attempts === 0 && progress.skills[skill].rating === 700)
                progress.skills[skill].rating = 0;
        }
        progress.achievements = achievements(progress);
        await progress.save();
        const matches = await Matchmaking_1.default.find({ userId: currentUser, status: 'matched' }).sort({ matchedAt: -1 });
        const completedBattles = await Battle_1.default.find({ 'players.userId': currentUser, status: 'complete' });
        const latestMatch = matches[0];
        const latestBattle = latestMatch?.matchId ? await Battle_1.default.findOne({ matchId: latestMatch.matchId }) : null;
        const latestOpponent = latestBattle?.players.find(player => player.userId !== currentUser);
        const wins = completedBattles.filter(battle => battle.players.find(player => player.userId === currentUser)?.ratingChange === 25).length;
        const losses = completedBattles.filter(battle => battle.players.find(player => player.userId === currentUser)?.ratingChange === -25).length;
        const weekStart = Date.now() - 7 * 86400000;
        const practiceWeeklyGain = (progress.recentActivity || []).filter((activity) => new Date(activity.createdAt).getTime() >= weekStart).reduce((total, activity) => total + activity.delta, 0);
        const battleWeeklyGain = completedBattles.filter(battle => new Date(battle.completedAt || 0).getTime() >= weekStart).reduce((total, battle) => total + (battle.players.find(player => player.userId === currentUser)?.ratingChange || 0), 0);
        const weeklyGain = practiceWeeklyGain + battleWeeklyGain;
        res.json({ ...progress.toObject(), arena: { acceptedChallenges: matches.length, wins, losses, weeklyGain, opponent: latestOpponent ? { name: latestOpponent.displayName, rating: latestOpponent.rating } : null } });
    }
    catch (error) {
        console.error('Progress fetch error:', error);
        res.status(500).json({ error: 'Could not load learning progress' });
    }
});
exports.progressRouter.post('/games', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const { skill, correct, total, seconds, difficulty = 1, dailyKey, mode } = req.body;
        if (!validSkill(skill) || !Number.isInteger(correct) || !Number.isInteger(total) || total <= 0 || correct < 0 || correct > total || !Number.isFinite(seconds) || seconds <= 0)
            return res.status(400).json({ error: 'Invalid game result' });
        const accuracy = Math.round((correct / total) * 100);
        const multiplier = mode === 'match' ? 35 : 10;
        const delta = Math.round((accuracy / 100 - 0.6) * multiplier);
        const today = dayKey();
        const progress = await LearningProgress_1.default.findOneAndUpdate({ userId: userId(req) }, { $setOnInsert: { userId: userId(req) } }, { new: true, upsert: true, setDefaultsOnInsert: true });
        const stats = progress.skills[skill];
        const wasDaily = dailyKey === today && !progress.dailyChallenges.includes(today);
        stats.rating = Math.max(0, stats.rating + delta);
        stats.attempts += 1;
        stats.bestScore = Math.max(stats.bestScore, correct);
        stats.bestAccuracy = Math.max(stats.bestAccuracy, accuracy);
        stats.totalSeconds += seconds;
        stats.difficulty = accuracy >= 80 ? Math.min(4, difficulty + 1) : accuracy < 50 ? Math.max(1, difficulty - 1) : difficulty;
        stats.lastPlayed = new Date();
        recordActivity(progress, today);
        if (wasDaily)
            progress.dailyChallenges.push(today);
        progress.recentActivity.unshift({ skill, score: correct, accuracy, seconds, delta, createdAt: new Date() });
        progress.recentActivity = progress.recentActivity.slice(0, 20);
        progress.achievements = achievements(progress);
        await progress.save();
        res.json({ progress, result: { skill, correct, total, accuracy, seconds, delta, dailyCompleted: wasDaily } });
    }
    catch (error) {
        console.error('Progress game save error:', error);
        res.status(500).json({ error: 'Could not save game result' });
    }
});
exports.progressRouter.post('/daily/complete', auth_1.AuthService.authenticateToken, async (req, res) => {
    res.status(400).json({ error: 'Complete the game through POST /api/game-zone/games' });
});
exports.progressRouter.post('/matchmaking/queue', auth_1.AuthService.authenticateToken, async (req, res) => {
    let rating;
    try {
        const { skill, mode = 'friendly', displayName = 'Student' } = req.body;
        if (!validSkill(skill))
            return res.status(400).json({ error: 'A valid skill is required' });
        const currentUser = userId(req);
        const progress = await LearningProgress_1.default.findOneAndUpdate({ userId: currentUser }, { $setOnInsert: { userId: currentUser } }, { new: true, upsert: true, setDefaultsOnInsert: true });
        const currentRating = progress.skills[skill].rating;
        rating = currentRating;
        await Matchmaking_1.default.deleteMany({ expiresAt: { $lt: new Date() } });
        const currentEntry = await Matchmaking_1.default.findOneAndUpdate({ userId: currentUser, skill, mode }, { displayName: String(displayName).slice(0, 40), rating, status: 'waiting', $unset: { matchId: 1, opponentId: 1, opponentRating: 1 }, expiresAt: new Date(Date.now() + 120000) }, { new: true, upsert: true, setDefaultsOnInsert: true });
        const candidateFilter = { skill, mode, status: 'waiting', userId: { $ne: currentUser } };
        const [lowerCandidate, upperCandidate] = await Promise.all([
            Matchmaking_1.default.findOne({ ...candidateFilter, rating: { $gte: currentRating - 75, $lte: currentRating } }).sort({ rating: -1 }),
            Matchmaking_1.default.findOne({ ...candidateFilter, rating: { $gt: currentRating, $lte: currentRating + 75 } }).sort({ rating: 1 }),
        ]);
        const candidate = !lowerCandidate ? upperCandidate
            : !upperCandidate ? lowerCandidate
                : currentRating - lowerCandidate.rating <= upperCandidate.rating - currentRating ? lowerCandidate
                    : upperCandidate;
        const opponent = candidate ? await Matchmaking_1.default.findOneAndUpdate({ _id: candidate._id, status: 'waiting' }, { status: 'invited', invitedBy: currentUser, invitationId: currentEntry._id.toString(), matchedAt: new Date() }, { new: true }) : null;
        if (opponent) {
            await Matchmaking_1.default.findByIdAndUpdate(currentEntry._id, { status: 'pending_acceptance', invitationId: opponent._id.toString(), opponentId: opponent.userId, opponentRating: opponent.rating });
            return res.json({ status: 'pending_acceptance', queueId: currentEntry._id.toString(), opponent: { name: opponent.displayName || 'Student', rating: opponent.rating } });
        }
        res.json({ status: 'waiting', queueId: String(currentEntry._id), message: 'Waiting for a student near your level' });
    }
    catch (error) {
        if (error?.code === 11000) {
            const existing = await Matchmaking_1.default.findOneAndUpdate({ userId: userId(req), skill: req.body.skill, mode: req.body.mode || 'friendly' }, { status: 'waiting', rating: rating ?? 0, displayName: String(req.body.displayName || 'Student').slice(0, 40), expiresAt: new Date(Date.now() + 120000) }, { new: true });
            if (existing && rating !== undefined)
                return res.json({ status: 'waiting', queueId: String(existing._id), message: 'Waiting for a student near your level' });
        }
        console.error('Matchmaking queue error:', error);
        res.status(500).json({ error: 'Could not join matchmaking queue' });
    }
});
exports.progressRouter.get('/matchmaking/:queueId', auth_1.AuthService.authenticateToken, async (req, res) => {
    const entry = await Matchmaking_1.default.findOne({ _id: req.params.queueId, userId: userId(req) });
    if (!entry)
        return res.status(404).json({ error: 'Matchmaking entry not found' });
    const opponent = entry.opponentId ? await Matchmaking_1.default.findOne({ userId: entry.opponentId, skill: entry.skill, mode: entry.mode, matchId: entry.matchId }) : null;
    const inviter = entry.invitedBy ? await Matchmaking_1.default.findOne({ userId: entry.invitedBy, invitationId: entry._id.toString() }) : null;
    res.json({ status: entry.status, matchId: entry.matchId, queueId: entry._id.toString(), invitationId: entry.invitationId, opponent: opponent ? { name: opponent.displayName || 'Student', rating: opponent.rating } : inviter ? { name: inviter.displayName || 'Student', rating: inviter.rating } : null });
});
exports.progressRouter.post('/matchmaking/:queueId/accept', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const entry = await Matchmaking_1.default.findOne({ _id: req.params.queueId, userId: userId(req), status: 'invited' });
        if (!entry || !entry.invitedBy)
            return res.status(404).json({ error: 'Invitation not found or already handled' });
        const inviter = await Matchmaking_1.default.findOne({ userId: entry.invitedBy, skill: entry.skill, mode: entry.mode, status: 'pending_acceptance', invitationId: entry._id.toString() });
        if (!inviter)
            return res.status(409).json({ error: 'The invitation is no longer available' });
        const matchId = new mongoose_1.default.Types.ObjectId().toString();
        const [firstLearner, secondLearner] = await Promise.all([
            (0, adaptiveLearnerService_1.getAdaptiveLearner)(entry.userId, entry.skill),
            (0, adaptiveLearnerService_1.getAdaptiveLearner)(inviter.userId, inviter.skill),
        ]);
        const excludedQuestionIds = new Set([
            ...firstLearner.seenQuestionIds,
            ...secondLearner.seenQuestionIds,
        ]);
        const firstQuestion = (0, adaptiveQuestionModel_1.selectAdaptiveQuestion)(entry.skill, (firstLearner.ability + secondLearner.ability) / 2, excludedQuestionIds);
        await Matchmaking_1.default.findByIdAndUpdate(entry._id, { status: 'matched', matchId, opponentId: inviter.userId, opponentRating: inviter.rating });
        await Matchmaking_1.default.findByIdAndUpdate(inviter._id, { status: 'matched', matchId, opponentId: entry.userId, opponentRating: entry.rating });
        await Battle_1.default.create({
            matchId,
            skill: entry.skill,
            questionLimit: adaptiveQuestionModel_1.BATTLE_QUESTION_COUNT,
            questions: [firstQuestion],
            players: [
                { userId: entry.userId, displayName: entry.displayName || 'Student', rating: entry.rating, ability: firstLearner.ability, responses: [] },
                { userId: inviter.userId, displayName: inviter.displayName || 'Student', rating: inviter.rating, ability: secondLearner.ability, responses: [] },
            ],
            startedAt: new Date(Date.now() + 3500),
        });
        await Promise.all([
            (0, adaptiveLearnerService_1.markAdaptiveQuestionSeen)(entry.userId, entry.skill, firstQuestion.id),
            (0, adaptiveLearnerService_1.markAdaptiveQuestionSeen)(inviter.userId, entry.skill, firstQuestion.id),
        ]);
        res.json({ status: 'matched', matchId, opponent: { name: inviter.displayName || 'Student', rating: inviter.rating } });
    }
    catch (error) {
        console.error('Accept matchmaking invitation error:', error);
        res.status(500).json({ error: 'Could not start the battle' });
    }
});
exports.progressRouter.get('/battle/:matchId', auth_1.AuthService.authenticateToken, async (req, res) => {
    const battle = await Battle_1.default.findOne({ matchId: req.params.matchId });
    if (!battle || !battle.players.some(player => player.userId === userId(req)))
        return res.status(404).json({ error: 'Battle not found' });
    if (battle.status === 'countdown' && Date.now() >= battle.startedAt.getTime()) {
        battle.status = 'active';
        await battle.save();
    }
    const updatedBattle = await completeBattle(battle);
    res.json(publicBattle(updatedBattle, userId(req)));
});
exports.progressRouter.post('/battle/:matchId/answer', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const currentUser = userId(req);
        const { answer, questionIndex } = req.body || {};
        if (!Number.isInteger(answer) || answer < 0 || answer > 3 ||
            (questionIndex !== undefined && (!Number.isInteger(questionIndex) || questionIndex < 0))) {
            return res.status(400).json({ error: 'Choose a valid answer option' });
        }
        for (let attempt = 0; attempt < 4; attempt += 1) {
            const battle = await Battle_1.default.findOne({ matchId: req.params.matchId });
            if (!battle || !battle.players.some(player => player.userId === currentUser)) {
                return res.status(404).json({ error: 'Battle not found' });
            }
            if (battle.status === 'countdown' && Date.now() >= battle.startedAt.getTime())
                battle.status = 'active';
            const player = battle.players.find(item => item.userId === currentUser);
            const currentQuestionIndex = Math.min(...battle.players.map(item => item.index));
            if (questionIndex !== undefined && questionIndex < player.index) {
                return res.json(publicBattle(battle, currentUser));
            }
            if (questionIndex !== undefined && questionIndex !== currentQuestionIndex) {
                return res.status(409).json({ error: 'The current question has changed; refresh the battle' });
            }
            const question = battle.questions[currentQuestionIndex];
            if (battle.status !== 'active' || !question || currentQuestionIndex >= battle.questionLimit) {
                return res.status(400).json({ error: 'The battle is not accepting that answer' });
            }
            if (player.index > currentQuestionIndex) {
                return res.json(publicBattle(battle, currentUser));
            }
            if (player.index !== currentQuestionIndex) {
                return res.status(409).json({ error: 'Wait for the other player to finish the current question' });
            }
            const correct = answer === question.answer;
            player.responses.push({ questionId: question.id, selectedOption: answer, correct });
            if (correct)
                player.correct += 1;
            player.ability = (0, adaptiveQuestionModel_1.updateAbility)(player.ability || 2.5, correct, question.difficulty);
            player.index += 1;
            const bothAnswered = battle.players.every(item => item.index > currentQuestionIndex);
            if (bothAnswered && player.index < battle.questionLimit) {
                const learnerHistory = await AdaptiveLearner_1.default.find({
                    userId: { $in: battle.players.map(item => item.userId) },
                    skill: battle.skill,
                });
                const seenQuestionIds = new Set(learnerHistory.flatMap(item => item.seenQuestionIds));
                const currentBattleQuestionIds = new Set(battle.questions.map(item => item.id));
                const averageAbility = battle.players.reduce((sum, item) => sum + item.ability, 0) / battle.players.length;
                const nextQuestion = (0, adaptiveQuestionModel_1.selectAdaptiveQuestion)(battle.skill, averageAbility, seenQuestionIds, currentBattleQuestionIds);
                battle.questions.push(nextQuestion);
                await Promise.all(battle.players.map(item => (0, adaptiveLearnerService_1.markAdaptiveQuestionSeen)(item.userId, battle.skill, nextQuestion.id)));
            }
            try {
                await battle.save();
            }
            catch (error) {
                if (error instanceof mongoose_1.default.Error.VersionError && attempt < 3)
                    continue;
                throw error;
            }
            await (0, adaptiveLearnerService_1.recordAdaptiveAnswer)(currentUser, battle.skill, question.id, question.difficulty, correct);
            const updatedBattle = await completeBattle(battle);
            return res.json(publicBattle(updatedBattle, currentUser));
        }
        return res.status(409).json({ error: 'The other answer is being saved; please try again' });
    }
    catch (error) {
        console.error('Battle answer error:', error);
        return res.status(500).json({ error: 'Could not save your battle answer' });
    }
});
exports.progressRouter.post('/matchmaking/:queueId/decline', auth_1.AuthService.authenticateToken, async (req, res) => {
    const entry = await Matchmaking_1.default.findOne({ _id: req.params.queueId, userId: userId(req), status: 'invited' });
    if (!entry || !entry.invitedBy)
        return res.status(404).json({ error: 'Invitation not found or already handled' });
    await Matchmaking_1.default.findByIdAndUpdate(entry._id, { status: 'declined' });
    await Matchmaking_1.default.findOneAndUpdate({ userId: entry.invitedBy, skill: entry.skill, mode: entry.mode, status: 'pending_acceptance', invitationId: entry._id.toString() }, { status: 'waiting', $unset: { invitationId: 1, opponentId: 1, opponentRating: 1 }, expiresAt: new Date(Date.now() + 120000) });
    res.json({ status: 'declined' });
});
exports.progressRouter.delete('/matchmaking/queue', auth_1.AuthService.authenticateToken, async (req, res) => {
    await Matchmaking_1.default.deleteOne({ userId: userId(req), status: 'waiting' });
    res.status(204).send();
});
