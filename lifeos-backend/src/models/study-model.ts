import mongoose, { Schema, Document } from 'mongoose';
import { IStudySession } from '../types/study-types';

export interface IStudyDocument extends Omit<IStudySession, '_id' | 'id'>, Document {}

const StudySchema = new Schema<IStudyDocument>(
  {
    subject: { type: String, required: true, trim: true },
    topic: { type: String, trim: true },
    duration: { type: Number, default: 25 },
    durationMinutes: { type: Number, default: 25 },
    durationHours: { type: Number, default: 0.42 },
    type: { type: String, default: 'Pomodoro' },
    mood: { type: String, default: 'Focused' },
    date: { type: String },
    timestamp: { type: String },
    notes: { type: String, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const StudyModel = mongoose.model<IStudyDocument>('StudySession', StudySchema);
