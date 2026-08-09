import mongoose, { Schema, Document } from 'mongoose';

export interface IAdaptiveParams extends Document {
  userId: string;
  phase: string;
  params: any;
  lastUpdated: Date;
}

const AdaptiveParamsSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  phase: { type: String, required: true },
  params: { type: Schema.Types.Mixed, required: true },
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model<IAdaptiveParams>('AdaptiveParams', AdaptiveParamsSchema);
