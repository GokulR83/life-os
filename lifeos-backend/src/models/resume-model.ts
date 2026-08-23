import mongoose, { Schema, Document } from 'mongoose';
import { IResumeVersion } from '../types/resume-types';

export interface IResumeDocument extends Omit<IResumeVersion, '_id' | 'id'>, Document {}

const ResumeSchema = new Schema<IResumeDocument>(
  {
    filename: { type: String, required: true, trim: true },
    targetRole: { type: String, required: true, trim: true },
    uploadDate: { type: String },
    notes: { type: String, trim: true },
    fileUrl: { type: String, trim: true },
    usedInAppIds: [{ type: String }],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const ResumeModel = mongoose.model<IResumeDocument>('Resume', ResumeSchema);
