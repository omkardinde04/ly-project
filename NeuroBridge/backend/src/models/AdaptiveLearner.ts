import mongoose, { Document, Schema } from 'mongoose';
import type { AdaptiveSkill } from '../services/adaptiveQuestionModel';

export interface IAdaptiveLearner extends Document {
  userId: string;
  skill: AdaptiveSkill;
  ability: number;
  seenQuestionIds: string[];
  updatedAt: Date;
}

const AdaptiveLearnerSchema = new Schema<IAdaptiveLearner>({
  userId: { type: String, required: true },
  skill: { type: String, enum: ['sound', 'focus', 'memory', 'speed'], required: true },
  ability: { type: Number, min: 1, max: 4, default: 2.5 },
  seenQuestionIds: { type: [String], default: [] },
}, { timestamps: true });

AdaptiveLearnerSchema.index({ userId: 1, skill: 1 }, { unique: true });

export default mongoose.model<IAdaptiveLearner>('AdaptiveLearner', AdaptiveLearnerSchema);
