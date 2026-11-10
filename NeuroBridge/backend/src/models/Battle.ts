import mongoose, { Document, Schema } from 'mongoose';

export interface IBattlePlayer {
  userId: string;
  displayName: string;
  rating: number;
  ability: number;
  correct: number;
  index: number;
  responses: Array<{ questionId: string; selectedOption: number; correct: boolean }>;
  finishedAt?: Date;
  ratingChange?: number;
}

export interface IBattle extends Document {
  matchId: string;
  skill: string;
  questions: Array<{ id: string; prompt: string; options: string[]; answer: number; difficulty: number }>;
  questionLimit: number;
  players: IBattlePlayer[];
  status: 'countdown' | 'active' | 'complete';
  startedAt: Date;
  completedAt?: Date;
}

const playerSchema = new Schema<IBattlePlayer>({
  userId: { type: String, required: true },
  displayName: { type: String, required: true },
  rating: { type: Number, required: true },
  ability: { type: Number, min: 1, max: 4, default: 2.5 },
  correct: { type: Number, default: 0 },
  index: { type: Number, default: 0 },
  responses: {
    type: [{ questionId: String, selectedOption: Number, correct: Boolean }],
    default: [],
  },
  finishedAt: { type: Date },
  ratingChange: { type: Number },
}, { _id: false });

function legacyQuestionLimit(this: IBattle): number {
  return this.questions.length || 8;
}

const BattleSchema = new Schema<IBattle>({
  matchId: { type: String, required: true, unique: true, index: true },
  skill: { type: String, required: true },
  questions: [{
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    prompt: String,
    options: [String],
    answer: Number,
    difficulty: { type: Number, default: 2 },
  }],
  questionLimit: { type: Number, required: true, default: legacyQuestionLimit },
  players: { type: [playerSchema], required: true },
  status: { type: String, enum: ['countdown', 'active', 'complete'], default: 'countdown' },
  startedAt: { type: Date, required: true },
  completedAt: { type: Date },
}, { timestamps: true, optimisticConcurrency: true });

export default mongoose.model<IBattle>('Battle', BattleSchema);