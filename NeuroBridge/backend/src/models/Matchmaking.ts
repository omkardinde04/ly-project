import mongoose, { Document, Schema } from 'mongoose';

export interface IMatchmaking extends Document {
  userId: string;
  displayName?: string;
  skill: string;
  rating: number;
  mode: string;
  status: 'waiting' | 'pending_acceptance' | 'invited' | 'matched' | 'declined';
  invitationId?: string;
  invitedBy?: string;
  opponentId?: string;
  opponentRating?: number;
  matchId?: string;
  matchedAt?: Date;
  expiresAt: Date;
}

const MatchmakingSchema = new Schema<IMatchmaking>({
  userId: { type: String, required: true, index: true },
  displayName: { type: String },
  skill: { type: String, required: true, index: true },
  rating: { type: Number, required: true },
  mode: { type: String, default: 'friendly' },
  status: { type: String, enum: ['waiting', 'pending_acceptance', 'invited', 'matched', 'declined'], default: 'waiting', index: true },
  invitationId: { type: String },
  invitedBy: { type: String },
  opponentId: { type: String },
  opponentRating: { type: Number },
  matchId: { type: String },
  matchedAt: { type: Date },
  expiresAt: { type: Date, required: true, index: true },
}, { timestamps: true });

MatchmakingSchema.index({ userId: 1, skill: 1, mode: 1 }, { unique: true });
MatchmakingSchema.index({ status: 1, skill: 1, rating: 1, expiresAt: 1 });

export default mongoose.model<IMatchmaking>('Matchmaking', MatchmakingSchema);
