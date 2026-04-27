import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessmentResult extends Document {
  userId: number;
  googleId?: string;
  score: number;
  classification: string;
  metrics: any;
  createdAt: Date;
}

const AssessmentResultSchema: Schema = new Schema({
  userId: { type: Number, required: true },
  googleId: { type: String },
  score: { type: Number, required: true },
  classification: { type: String, required: true },
  metrics: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAssessmentResult>('AssessmentResult', AssessmentResultSchema);
