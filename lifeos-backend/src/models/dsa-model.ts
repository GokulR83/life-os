import mongoose, { Schema, Document } from 'mongoose';
import { IDsaProblem } from '../types/dsa-types';

export interface IDsaDocument extends Omit<IDsaProblem, '_id' | 'id'>, Document {}

const DsaSchema = new Schema<IDsaDocument>(
  {
    name: { type: String, trim: true },
    title: { type: String, trim: true },
    pattern: { type: String, trim: true },
    description: { type: String, trim: true },
    solvedProblems: { type: Number, default: 0 },
    totalProblems: { type: Number, default: 10 },
    difficulty: { type: String, default: 'Medium' },
    status: { type: String, default: 'Todo' },
    icon: { type: String },
    lastRevisedDate: { type: String },
    link: { type: String, trim: true },
    notes: { type: String, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const DsaModel = mongoose.model<IDsaDocument>('DsaProblem', DsaSchema);
