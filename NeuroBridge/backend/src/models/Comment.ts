import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  postId: { type: String, required: true, index: true },
  authorId: { type: String, required: true, index: true },
  content: { type: String, required: true, maxlength: 5000 },
}, { timestamps: true });

export default mongoose.model<IComment>('Comment', CommentSchema);
