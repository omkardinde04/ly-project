import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendation extends Document {
  course: mongoose.Types.ObjectId;
  recommender: mongoose.Types.ObjectId;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
}

const RecommendationSchema: Schema = new Schema({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  recommender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
