import mongoose, { Document, Schema } from 'mongoose';

export type LearningSkill = 'sound' | 'focus' | 'memory' | 'speed';

export interface ISkillStats {
  rating: number;
  attempts: number;
  bestScore: number;
  bestAccuracy: number;
  totalSeconds: number;
  difficulty: number;
  lastPlayed?: Date;
}

export interface ILearningProgress extends Document {
  userId: string;
  skills: Record<LearningSkill, ISkillStats>;
  completedChallenges: number;
  streak: number;
  lastPlayedDay?: string;
  activityDays: string[];
  dailyChallenges: string[];
  achievements: string[];
  recentActivity: Array<{ skill: LearningSkill; score: number; accuracy: number; seconds: number; delta: number; createdAt: Date }>;
}

const skillStats = () => ({
  rating: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  bestScore: { type: Number, default: 0 },
  bestAccuracy: { type: Number, default: 0 },
  totalSeconds: { type: Number, default: 0 },
  difficulty: { type: Number, default: 1 },
  lastPlayed: { type: Date },
});

const LearningProgressSchema = new Schema<ILearningProgress>({
  userId: { type: String, required: true, unique: true, index: true },
  skills: {
    sound: { type: skillStats(), default: () => ({}) },
    focus: { type: skillStats(), default: () => ({}) },
    memory: { type: skillStats(), default: () => ({}) },
    speed: { type: skillStats(), default: () => ({}) },
  },
  completedChallenges: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastPlayedDay: { type: String },
  activityDays: { type: [String], default: [] },
  dailyChallenges: { type: [String], default: [] },
  achievements: { type: [String], default: [] },
  recentActivity: [{ skill: String, score: Number, accuracy: Number, seconds: Number, delta: Number, createdAt: Date }],
}, { timestamps: true });

export default mongoose.model<ILearningProgress>('LearningProgress', LearningProgressSchema);
