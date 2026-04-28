import mongoose, { Schema, Document } from 'mongoose';

export interface IResume extends Document {
  user_email: string;
  data: any;
  template: string;
  created_at: Date;
  updated_at: Date;
}

const ResumeSchema: Schema = new Schema({
  user_email: { type: String, required: true },
  data: { type: Schema.Types.Mixed, required: true },
  template: { type: String, default: 'minimal' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model<IResume>('Resume', ResumeSchema);
