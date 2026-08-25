import mongoose, { Document, Schema } from 'mongoose';

export interface IConnection extends Document {
  requesterId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionSchema = new Schema<IConnection>({
  requesterId: { type: String, required: true, index: true },
  recipientId: { type: String, required: true, index: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending', index: true },
}, { timestamps: true });

ConnectionSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

export default mongoose.model<IConnection>('Connection', ConnectionSchema);
