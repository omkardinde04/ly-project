import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  category: string;
  instructor: mongoose.Types.ObjectId;
  thumbnail?: string;
  difficulty: string; // e.g., 'Beginner', 'Intermediate', 'Advanced'
  duration: string; // e.g., '2h 15m'
  learningObjectives: string[];
  accessibilityFeatures: string[]; // e.g., ['Captions', 'Transcript', 'Text-to-Speech']
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  aiValidationId?: mongoose.Types.ObjectId;
  rating: number;
  reviewCount: number;
  learnerCount: number;
  created_at: Date;
  updated_at: Date;
}

const CourseSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  thumbnail: { type: String },
  difficulty: { type: String, default: 'Beginner' },
  duration: { type: String, default: '0m' },
  learningObjectives: [{ type: String }],
  accessibilityFeatures: [{ type: String }],
  status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'draft' },
  rejectionReason: { type: String },
  aiValidationId: { type: Schema.Types.ObjectId, ref: 'AIValidation' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  learnerCount: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model<ICourse>('Course', CourseSchema);
