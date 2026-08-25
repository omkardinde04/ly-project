import mongoose, { Document, Schema } from 'mongoose';

export interface IBattlePlayer {
  userId: string;
  displayName: string;
  rating: number;
  correct: number;
  index: number;
  finishedAt?: Date;
  ratingChange?: number;
}

export interface IBattle extends Document {
  matchId: string;
  skill: string;
  questions: Array<{ prompt: string; options: string[]; answer: number }>;
  players: IBattlePlayer[];
  status: 'countdown' | 'active' | 'complete';
  startedAt: Date;
  completedAt?: Date;
}

const playerSchema = new Schema<IBattlePlayer>({
  userId: { type: String, required: true },
  displayName: { type: String, required: true },
  rating: { type: Number, required: true },
  correct: { type: Number, default: 0 },
  index: { type: Number, default: 0 },
  finishedAt: { type: Date },
  ratingChange: { type: Number },
}, { _id: false });

const BattleSchema = new Schema<IBattle>({
  matchId: { type: String, required: true, unique: true, index: true },
  skill: { type: String, required: true },
  questions: [{ prompt: String, options: [String], answer: Number }],
  players: { type: [playerSchema], required: true },
  status: { type: String, enum: ['countdown', 'active', 'complete'], default: 'countdown' },
  startedAt: { type: Date, required: true },
  completedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model<IBattle>('Battle', BattleSchema);