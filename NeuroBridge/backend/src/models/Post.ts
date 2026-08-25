import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  authorId: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  createdAt: Date;
}

const PostSchema = new Schema<IPost>({
  authorId: { type: String, required: true, index: true },
  title: { type: String, required: true, maxlength: 160 },
  content: { type: String, required: true, maxlength: 10000 },
  category: { type: String, required: true },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IPost>('Post', PostSchema);
