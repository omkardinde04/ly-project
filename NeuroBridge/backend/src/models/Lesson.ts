import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  videoUrl: string;
  transcript: string;
  summary: string;
  notes: string;
  quiz?: any; // Simple JSON for quiz questions/answers
  flashcards?: any; // Simple JSON for flashcards
  chapters?: any; // Array of { title: string, timestamp: string }
  duration: number; // in seconds
  order: number;
  created_at: Date;
  updated_at: Date;
}

const LessonSchema: Schema = new Schema({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  transcript: { type: String, default: '' },
  summary: { type: String, default: '' },
  notes: { type: String, default: '' },
  quiz: { type: Schema.Types.Mixed },
  flashcards: { type: Schema.Types.Mixed },
  chapters: { type: Schema.Types.Mixed },
  duration: { type: Number, default: 0 },
  order: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model<ILesson>('Lesson', LessonSchema);
