import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { AuthService } from '../auth';
import LearningProgress, { LearningSkill } from '../models/LearningProgress';
import Matchmaking from '../models/Matchmaking';
import Battle, { IBattle } from '../models/Battle';

export const progressRouter = Router();
const skills: LearningSkill[] = ['sound', 'focus', 'memory', 'speed'];
const dayKey = () => new Date().toISOString().slice(0, 10);
const userId = (req: any) => String(req.user.userId);

function validSkill(value: unknown): value is LearningSkill { return typeof value === 'string' && skills.includes(value as LearningSkill); }
function updateStreak(progress: any, today: string) {
  if (progress.lastPlayedDay === today) return progress.streak;
  if (!progress.lastPlayedDay) return 1;
  const previous = new Date(`${progress.lastPlayedDay}T00:00:00Z`).getTime();
  const current = new Date(`${today}T00:00:00Z`).getTime();
  return current - previous === 86400000 ? progress.streak + 1 : 1;
}
function achievements(progress: any) {
  const unlocked = new Set<string>(progress.achievements || []);
  if (progress.completedChallenges >= 1) unlocked.add('first-step');
  if (progress.streak >= 1) unlocked.add('one-day-streak');
  if (progress.skills.sound.attempts >= 10) unlocked.add('sound-hunter');
  if (progress.skills.focus.attempts >= 20) unlocked.add('focus-finder');
  if (progress.skills.speed.bestAccuracy >= 80) unlocked.add('speedster');
  if (progress.streak >= 7) unlocked.add('on-a-roll');
  if (progress.skills.memory.bestAccuracy >= 80 && progress.skills.memory.attempts >= 5) unlocked.add('memory-master');
  if (Object.values(progress.skills).some((skill: any) => skill.bestScore > 0 && skill.rating >= 800)) unlocked.add('personal-best');
  return [...unlocked];
}

type BattleQuestion = [string, string[], number, number, LearningSkill];
const battleQuestionPool: BattleQuestion[] = [
  ['Which word starts with the same sound as SUN?', ['Moon', 'Sock', 'Tree', 'Fish'], 1, 1, 'sound'],
  ['Which word ends with the same sound as CAT?', ['Cup', 'Map', 'Dog', 'Sun'], 1, 1, 'sound'],
  ['Which word rhymes with LIGHT?', ['Late', 'Night', 'Lot', 'Lift'], 1, 2, 'sound'],
  ['Which word starts with the same sound as BELL?', ['Ball', 'Moon', 'Fish', 'Tree'], 0, 2, 'sound'],
  ['Which word rhymes with DAY?', ['Die', 'Toy', 'Say', 'Do'], 2, 3, 'sound'],
  ['Which word starts with the same sound as FISH?', ['Fan', 'Goat', 'Ship', 'Tree'], 0, 3, 'sound'],
  ['Which word rhymes with BOOK?', ['Back', 'Look', 'Bike', 'Bake'], 1, 4, 'sound'],
  ['Which word starts with the same sound as STAR?', ['Stone', 'Car', 'Rain', 'Door'], 0, 4, 'sound'],
  ['Which shape has four equal sides?', ['Triangle', 'Square', 'Circle', 'Oval'], 1, 1, 'focus'],
  ['Which letter comes third alphabetically?', ['b', 'd', 'p', 'q'], 1, 1, 'focus'],
  ['Which symbol is different from the others?', ['+', 'x', 'o', '-'], 2, 2, 'focus'],
  ['Which word is written backwards?', ['TOP', 'SUN', 'RAT', 'GOD'], 3, 2, 'focus'],
  ['Which pair is exactly the same?', ['READ / REED', 'FOCUS / FOCUS', 'BRAIN / BRIAN', 'NOTE / NOT'], 1, 3, 'focus'],
  ['Which sequence is in alphabetical order?', ['DOG, CAT, BIRD', 'APPLE, BERRY, CHERRY', 'ZOO, ANT, BEE', 'SUN, MOON, STAR'], 1, 3, 'focus'],
  ['Which word contains two letter pairs?', ['BOOKKEEPER', 'CAT', 'SUN', 'FISH'], 0, 4, 'focus'],
  ['Which option has the most letters?', ['MAP', 'READ', 'UNDERSTAND', 'BOOK'], 2, 4, 'focus'],
  ['Remember: A, 3, B. What came after A?', ['B', '3', 'A', '2'], 1, 1, 'memory'],
  ['Remember: red, blue, green. What was first?', ['Green', 'Blue', 'Red', 'Yellow'], 2, 1, 'memory'],
  ['What number comes next: 2, 4, 6, ...?', ['7', '8', '9', '10'], 1, 2, 'memory'],
  ['What letter comes before D?', ['B', 'C', 'E', 'F'], 1, 2, 'memory'],
  ['Which sequence matches: sun, book, tree?', ['sun, tree, book', 'book, sun, tree', 'sun, book, tree', 'tree, book, sun'], 2, 3, 'memory'],
  ['What is missing: 5, 10, __, 20?', ['12', '14', '15', '18'], 2, 3, 'memory'],
  ['Which pattern follows A1, B2, C3?', ['D4', 'D3', 'E4', 'C4'], 0, 4, 'memory'],
  ['Which came third: first, second, third, fourth?', ['First', 'Second', 'Third', 'Fourth'], 2, 4, 'memory'],
  ['Which answer is fastest to read?', ['slow', 'quick', 'steady', 'later'], 1, 1, 'speed'],
  ['Which number is largest?', ['3', '8', '5', '1'], 1, 1, 'speed'],
  ['Which word does not belong?', ['Run', 'Walk', 'Jump', 'Blue'], 3, 2, 'speed'],
  ['What is 7 + 5?', ['10', '11', '12', '13'], 2, 2, 'speed'],
  ['What is 3 x 4?', ['7', '10', '12', '14'], 2, 3, 'speed'],
  ['Which fraction is greatest?', ['1/4', '1/2', '1/8', '1/10'], 1, 3, 'speed'],
  ['What is 18 - 9?', ['7', '8', '9', '10'], 2, 4, 'speed'],
  ['What is 6 x 7?', ['36', '40', '42', '48'], 2, 4, 'speed'],
];

function shuffled<T>(items: T[]) { return items.slice().sort(() => Math.random() - 0.5); }
function createBattleQuestions() {
  const selected: BattleQuestion[] = [];
  for (const skill of skills) {
    const pool = shuffled(battleQuestionPool.filter(question => question[4] === skill));
    const byDifficulty = [1, 2, 3, 4].map(level => pool.find(question => question[3] === level)!);
    selected.push(...byDifficulty, pool.find(question => !byDifficulty.includes(question))!);
  }
  return shuffled(selected).sort((a, b) => a[3] - b[3]).map(([prompt, options, answer]) => ({ prompt, options, answer }));
}

function publicBattle(battle: IBattle, currentUser: string) {
  const player = battle.players.find(item => item.userId === currentUser)!;
  const opponent = battle.players.find(item => item.userId !== currentUser)!;
  return {
    matchId: battle.matchId, skill: battle.skill, status: battle.status, startedAt: battle.startedAt, endsAt: new Date(battle.startedAt.getTime() + 120000),
    question: battle.status === 'active' && player.index < battle.questions.length ? { index: player.index, total: battle.questions.length, prompt: battle.questions[player.index].prompt, options: battle.questions[player.index].options } : null,
    you: { name: player.displayName, rating: player.rating, correct: player.correct, index: player.index, finishedAt: player.finishedAt },
    opponent: { name: opponent.displayName, rating: opponent.rating, correct: opponent.correct, index: opponent.index, finishedAt: opponent.finishedAt },
    result: battle.status === 'complete' ? { winnerId: battle.players.find(item => item.ratingChange === 25)?.userId || null, yourRating: player.rating, opponentRating: opponent.rating, yourRatingChange: player.ratingChange || 0, opponentRatingChange: opponent.ratingChange || 0 } : null,
  };
}

async function completeBattle(battle: IBattle) {
  const timeExpired = Date.now() >= battle.startedAt.getTime() + 120000;
  const bothFinished = battle.players.every(player => player.index >= battle.questions.length);
  if (battle.status === 'complete' || (!timeExpired && !bothFinished)) return;
  battle.status = 'complete'; battle.completedAt = new Date();
  const [first, second] = battle.players;
  if (first.correct !== second.correct) {
    const winner = first.correct > second.correct ? first : second;
    const loser = first.correct > second.correct ? second : first;
    winner.ratingChange = 25;
    loser.ratingChange = -25;
  } else {
    first.ratingChange = 0;
    second.ratingChange = 0;
  }
  for (const player of battle.players) {
    const progress: any = await LearningProgress.findOneAndUpdate({ userId: player.userId }, { $setOnInsert: { userId: player.userId } }, { new: true, upsert: true, setDefaultsOnInsert: true });
    progress.skills[battle.skill as LearningSkill].rating = Math.max(0, progress.skills[battle.skill as LearningSkill].rating + (player.ratingChange || 0));
    player.rating = progress.skills[battle.skill as LearningSkill].rating;
    await progress.save();
  }
  await battle.save();
}

progressRouter.get('/', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const currentUser = userId(req);
    const progress = await LearningProgress.findOneAndUpdate({ userId: currentUser }, { $setOnInsert: { userId: currentUser } }, { new: true, upsert: true, setDefaultsOnInsert: true });
    for (const skill of ['sound', 'focus', 'memory', 'speed'] as LearningSkill[]) {
      if (progress.skills[skill].attempts === 0 && progress.skills[skill].rating === 700) progress.skills[skill].rating = 0;
    }
    progress.achievements = achievements(progress);
    await progress.save();
    const matches = await Matchmaking.find({ userId: currentUser, status: 'matched' }).sort({ matchedAt: -1 });
    const completedBattles = await Battle.find({ 'players.userId': currentUser, status: 'complete' });
    const latestMatch = matches[0];
    const latestBattle = latestMatch?.matchId ? await Battle.findOne({ matchId: latestMatch.matchId }) : null;
    const latestOpponent = latestBattle?.players.find(player => player.userId !== currentUser);
    const wins = completedBattles.filter(battle => battle.players.find(player => player.userId === currentUser)?.ratingChange === 25).length;
    const losses = completedBattles.filter(battle => battle.players.find(player => player.userId === currentUser)?.ratingChange === -25).length;
    const weekStart = Date.now() - 7 * 86400000;
    const practiceWeeklyGain = (progress.recentActivity || []).filter((activity: any) => new Date(activity.createdAt).getTime() >= weekStart).reduce((total: number, activity: any) => total + activity.delta, 0);
    const battleWeeklyGain = completedBattles.filter(battle => new Date(battle.completedAt || 0).getTime() >= weekStart).reduce((total, battle) => total + (battle.players.find(player => player.userId === currentUser)?.ratingChange || 0), 0);
    const weeklyGain = practiceWeeklyGain + battleWeeklyGain;
    res.json({ ...progress.toObject(), arena: { acceptedChallenges: matches.length, wins, losses, weeklyGain, opponent: latestOpponent ? { name: latestOpponent.displayName, rating: latestOpponent.rating } : null } });
  } catch (error) { console.error('Progress fetch error:', error); res.status(500).json({ error: 'Could not load learning progress' }); }
});

progressRouter.post('/games', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const { skill, correct, total, seconds, difficulty = 1, dailyKey } = req.body;
    if (!validSkill(skill) || !Number.isInteger(correct) || !Number.isInteger(total) || total <= 0 || correct < 0 || correct > total || !Number.isFinite(seconds) || seconds <= 0) return res.status(400).json({ error: 'Invalid game result' });
    const accuracy = Math.round((correct / total) * 100);
    const delta = Math.round((accuracy / 100 - 0.6) * 35);
    const today = dayKey();
    const progress: any = await LearningProgress.findOneAndUpdate({ userId: userId(req) }, { $setOnInsert: { userId: userId(req) } }, { new: true, upsert: true, setDefaultsOnInsert: true });
    const stats = progress.skills[skill];
    const wasDaily = dailyKey === today && !progress.dailyChallenges.includes(today);
    stats.rating = Math.max(0, stats.rating + delta);
    stats.attempts += 1;
    stats.bestScore = Math.max(stats.bestScore, correct);
    stats.bestAccuracy = Math.max(stats.bestAccuracy, accuracy);
    stats.totalSeconds += seconds;
    stats.difficulty = accuracy >= 80 ? Math.min(4, difficulty + 1) : accuracy < 50 ? Math.max(1, difficulty - 1) : difficulty;
    stats.lastPlayed = new Date();
    progress.completedChallenges += 1;
    progress.streak = updateStreak(progress, today);
    progress.lastPlayedDay = today;
    if (!progress.activityDays.includes(today)) progress.activityDays.push(today);
    if (wasDaily) progress.dailyChallenges.push(today);
    progress.recentActivity.unshift({ skill, score: correct, accuracy, seconds, delta, createdAt: new Date() });
    progress.recentActivity = progress.recentActivity.slice(0, 20);
    progress.achievements = achievements(progress);
    await progress.save();
    res.json({ progress, result: { skill, correct, total, accuracy, seconds, delta, dailyCompleted: wasDaily } });
  } catch (error) { console.error('Progress game save error:', error); res.status(500).json({ error: 'Could not save game result' }); }
});

progressRouter.post('/daily/complete', AuthService.authenticateToken, async (req: any, res: Response) => {
  res.status(400).json({ error: 'Complete the game through POST /api/progress/games' });
});

progressRouter.post('/matchmaking/queue', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const { skill, rating, mode = 'friendly', displayName = 'Student' } = req.body;
    if (!validSkill(skill) || !Number.isFinite(rating)) return res.status(400).json({ error: 'Skill and rating are required' });
    const currentUser = userId(req);
    await Matchmaking.deleteMany({ expiresAt: { $lt: new Date() } });
    const currentEntry = await Matchmaking.findOneAndUpdate(
      { userId: currentUser, skill, mode },
      { displayName: String(displayName).slice(0, 40), rating, status: 'waiting', $unset: { matchId: 1, opponentId: 1, opponentRating: 1 }, expiresAt: new Date(Date.now() + 120000) },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const opponent = await Matchmaking.findOneAndUpdate(
      { skill, mode, status: 'waiting', userId: { $ne: currentUser }, rating: { $gte: rating - 75, $lte: rating + 75 } },
      { status: 'invited', invitedBy: currentUser, invitationId: currentEntry._id.toString(), matchedAt: new Date() },
      { new: true, sort: { rating: 1 } }
    );
    if (opponent) {
      await Matchmaking.findByIdAndUpdate(currentEntry._id, { status: 'pending_acceptance', invitationId: opponent._id.toString(), opponentId: opponent.userId, opponentRating: opponent.rating });
      return res.json({ status: 'pending_acceptance', queueId: currentEntry._id.toString(), opponent: { name: opponent.displayName || 'Student', rating: opponent.rating } });
    }
    res.json({ status: 'waiting', queueId: String(currentEntry._id), message: 'Waiting for a student near your level' });
  } catch (error: any) {
    if (error?.code === 11000) {
      const existing = await Matchmaking.findOneAndUpdate(
        { userId: userId(req), skill: req.body.skill, mode: req.body.mode || 'friendly' },
        { status: 'waiting', rating: req.body.rating, displayName: String(req.body.displayName || 'Student').slice(0, 40), expiresAt: new Date(Date.now() + 120000) },
        { new: true }
      );
      if (existing) return res.json({ status: 'waiting', queueId: String(existing._id), message: 'Waiting for a student near your level' });
    }
    console.error('Matchmaking queue error:', error); res.status(500).json({ error: 'Could not join matchmaking queue' });
  }
});

progressRouter.get('/matchmaking/:queueId', AuthService.authenticateToken, async (req: any, res: Response) => {
  const entry = await Matchmaking.findOne({ _id: req.params.queueId, userId: userId(req) });
  if (!entry) return res.status(404).json({ error: 'Matchmaking entry not found' });
  const opponent = entry.opponentId ? await Matchmaking.findOne({ userId: entry.opponentId, skill: entry.skill, mode: entry.mode, matchId: entry.matchId }) : null;
  const inviter = entry.invitedBy ? await Matchmaking.findOne({ userId: entry.invitedBy, invitationId: entry._id.toString() }) : null;
  res.json({ status: entry.status, matchId: entry.matchId, queueId: entry._id.toString(), invitationId: entry.invitationId, opponent: opponent ? { name: opponent.displayName || 'Student', rating: opponent.rating } : inviter ? { name: inviter.displayName || 'Student', rating: inviter.rating } : null });
});

progressRouter.post('/matchmaking/:queueId/accept', AuthService.authenticateToken, async (req: any, res: Response) => {
  const entry = await Matchmaking.findOne({ _id: req.params.queueId, userId: userId(req), status: 'invited' });
  if (!entry || !entry.invitedBy) return res.status(404).json({ error: 'Invitation not found or already handled' });
  const inviter = await Matchmaking.findOne({ userId: entry.invitedBy, skill: entry.skill, mode: entry.mode, status: 'pending_acceptance', invitationId: entry._id.toString() });
  if (!inviter) return res.status(409).json({ error: 'The invitation is no longer available' });
  const matchId = new mongoose.Types.ObjectId().toString();
  await Matchmaking.findByIdAndUpdate(entry._id, { status: 'matched', matchId, opponentId: inviter.userId, opponentRating: inviter.rating });
  await Matchmaking.findByIdAndUpdate(inviter._id, { status: 'matched', matchId, opponentId: entry.userId, opponentRating: entry.rating });
  await Battle.create({ matchId, skill: entry.skill, questions: createBattleQuestions(), players: [
    { userId: entry.userId, displayName: entry.displayName || 'Student', rating: entry.rating },
    { userId: inviter.userId, displayName: inviter.displayName || 'Student', rating: inviter.rating },
  ], startedAt: new Date(Date.now() + 3500) });
  res.json({ status: 'matched', matchId, opponent: { name: inviter.displayName || 'Student', rating: inviter.rating } });
});

progressRouter.get('/battle/:matchId', AuthService.authenticateToken, async (req: any, res: Response) => {
  const battle = await Battle.findOne({ matchId: req.params.matchId });
  if (!battle || !battle.players.some(player => player.userId === userId(req))) return res.status(404).json({ error: 'Battle not found' });
  if (battle.status === 'countdown' && Date.now() >= battle.startedAt.getTime()) { battle.status = 'active'; await battle.save(); }
  await completeBattle(battle);
  res.json(publicBattle(battle, userId(req)));
});

progressRouter.post('/battle/:matchId/answer', AuthService.authenticateToken, async (req: any, res: Response) => {
  const battle = await Battle.findOne({ matchId: req.params.matchId });
  if (!battle || !battle.players.some(player => player.userId === userId(req))) return res.status(404).json({ error: 'Battle not found' });
  if (battle.status === 'countdown' && Date.now() >= battle.startedAt.getTime()) battle.status = 'active';
  const player = battle.players.find(item => item.userId === userId(req))!;
  const question = battle.questions[player.index];
  if (battle.status !== 'active' || !question || !Number.isInteger(req.body.answer)) return res.status(400).json({ error: 'The battle is not accepting that answer' });
  if (req.body.answer === question.answer) player.correct += 1;
  player.index += 1;
  await completeBattle(battle);
  await battle.save();
  res.json(publicBattle(battle, userId(req)));
});

progressRouter.post('/matchmaking/:queueId/decline', AuthService.authenticateToken, async (req: any, res: Response) => {
  const entry = await Matchmaking.findOne({ _id: req.params.queueId, userId: userId(req), status: 'invited' });
  if (!entry || !entry.invitedBy) return res.status(404).json({ error: 'Invitation not found or already handled' });
  await Matchmaking.findByIdAndUpdate(entry._id, { status: 'declined' });
  await Matchmaking.findOneAndUpdate({ userId: entry.invitedBy, skill: entry.skill, mode: entry.mode, status: 'pending_acceptance', invitationId: entry._id.toString() }, { status: 'waiting', $unset: { invitationId: 1, opponentId: 1, opponentRating: 1 }, expiresAt: new Date(Date.now() + 120000) });
  res.json({ status: 'declined' });
});

progressRouter.delete('/matchmaking/queue', AuthService.authenticateToken, async (req: any, res: Response) => {
  await Matchmaking.deleteOne({ userId: userId(req), status: 'waiting' });
  res.status(204).send();
});
