import mongoose, { Schema, Document } from 'mongoose';

export interface IAIValidation extends Document {
  course: mongoose.Types.ObjectId; // Optional, might be linked to a lesson instead
  lesson?: mongoose.Types.ObjectId;
  primaryCategory: string;
  categoryScores: any; // JSON with category probabilities
  educationalResult: boolean;
  safetyResult: boolean;
  titleMatch: boolean;
  confidence: number;
  decision: 'approve' | 'needs_review' | 'reject';
  reason: string;
  created_at: Date;
}

const AIValidationSchema: Schema = new Schema({
  course: { type: Schema.Types.ObjectId, ref: 'Course' },
  lesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
  primaryCategory: { type: String, required: true },
  categoryScores: { type: Schema.Types.Mixed, required: true },
  educationalResult: { type: Boolean, required: true },
  safetyResult: { type: Boolean, required: true },
  titleMatch: { type: Boolean, required: true },
  confidence: { type: Number, required: true },
  decision: { type: String, enum: ['approve', 'needs_review', 'reject'], required: true },
  reason: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IAIValidation>('AIValidation', AIValidationSchema);
