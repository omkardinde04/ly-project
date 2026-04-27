import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  google_id?: string;
  name: string;
  email: string;
  password?: string;
  profile_picture?: string;
  assessment_completed: boolean;
  assessment_score?: number;
  classification?: string;
  assessment_metrics?: string;
  email_verified: boolean;
  verification_token?: string;
  verification_token_expiry?: Date;
  reset_token?: string;
  reset_token_expiry?: Date;
  created_at: Date;
}

const UserSchema: Schema = new Schema({
  google_id: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  profile_picture: { type: String },
  assessment_completed: { type: Boolean, default: false },
  assessment_score: { type: Number },
  classification: { type: String },
  assessment_metrics: { type: String },
  email_verified: { type: Boolean, default: false },
  verification_token: { type: String },
  verification_token_expiry: { type: Date },
  reset_token: { type: String },
  reset_token_expiry: { type: Date },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);
