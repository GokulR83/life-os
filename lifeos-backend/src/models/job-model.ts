import mongoose, { Schema, Document } from 'mongoose';
import { IJobApplication } from '../types/job-types';

export interface IJobDocument extends Omit<IJobApplication, '_id' | 'id'>, Document {}

const JobSchema = new Schema<IJobDocument>(
  {
    company: { type: String, required: true, trim: true },
    position: { type: String, trim: true },
    role: { type: String, trim: true },
    status: { type: String, default: 'Applied' },
    location: { type: String, trim: true },
    salary: { type: String, trim: true },
    salaryRange: { type: String, trim: true },
    logo: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    dateApplied: { type: String },
    appliedDate: { type: String },
    lastUpdated: { type: String },
    stale: { type: Boolean, default: false },
    link: { type: String, trim: true },
    notes: { type: String, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const JobModel = mongoose.model<IJobDocument>('JobApplication', JobSchema);
