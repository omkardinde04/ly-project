import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  progress: number; // 0 to 100
  completedLessons: mongoose.Types.ObjectId[];
  lastLesson?: mongoose.Types.ObjectId;
  quizScores: any; // e.g. { lessonId: score }
  timeSpent: number; // in seconds
  enrolled_date: Date;
  completion_date?: Date;
}

const EnrollmentSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, default: 0 },
  completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  lastLesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
  quizScores: { type: Schema.Types.Mixed, default: {} },
  timeSpent: { type: Number, default: 0 },
  enrolled_date: { type: Date, default: Date.now },
  completion_date: { type: Date }
});

export default mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
