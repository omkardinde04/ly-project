import mongoose, { Document, Schema } from 'mongoose';
import type { AdaptiveSkill } from '../services/adaptiveQuestionModel';

interface IRunQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  difficulty: number;
}

interface IRunResponse {
  questionId: string;
  selectedOption: number;
  correct: boolean;
}

export interface IAdaptivePracticeRun extends Document {
  userId: string;
  skill: AdaptiveSkill;
  status: 'active' | 'complete' | 'abandoned';
  questions: IRunQuestion[];
  responses: IRunResponse[];
  ability: number;
  questionLimit: number;
  createdAt: Date;
}

const AdaptivePracticeRunSchema = new Schema<IAdaptivePracticeRun>({
  userId: { type: String, required: true, index: true },
  skill: { type: String, enum: ['sound', 'focus', 'memory', 'speed'], required: true },
  status: { type: String, enum: ['active', 'complete', 'abandoned'], default: 'active' },
  questions: [{
    id: { type: String, required: true },
    prompt: { type: String, required: true },
    options: { type: [String], required: true },
    answer: { type: Number, required: true },
    difficulty: { type: Number, required: true },
  }],
  responses: [{
    questionId: { type: String, required: true },
    selectedOption: { type: Number, required: true },
    correct: { type: Boolean, required: true },
  }],
  ability: { type: Number, min: 1, max: 4, required: true },
  questionLimit: { type: Number, required: true },
}, { timestamps: true, optimisticConcurrency: true });

export default mongoose.model<IAdaptivePracticeRun>('AdaptivePracticeRun', AdaptivePracticeRunSchema);
