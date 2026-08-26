import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  comment: string;
  accessibilityFeedback?: string;
  created_at: Date;
}

const ReviewSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  accessibilityFeedback: { type: String },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IReview>('Review', ReviewSchema);
