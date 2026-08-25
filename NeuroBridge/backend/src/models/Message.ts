import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  senderId: string;
  recipientId: string;
  text: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  senderId: { type: String, required: true, index: true },
  recipientId: { type: String, required: true, index: true },
  text: { type: String, required: true, maxlength: 2000 },
}, { timestamps: true });

MessageSchema.index({ senderId: 1, recipientId: 1, createdAt: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
