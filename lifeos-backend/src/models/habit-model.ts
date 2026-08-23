import mongoose, { Schema, Document } from 'mongoose';
import { IHabit } from '../types/habit-types';

export interface IHabitDocument extends Omit<IHabit, '_id' | 'id'>, Document {}

const HabitSchema = new Schema<IHabitDocument>(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, trim: true },
    category: { type: String, default: 'Personal' },
    frequency: { type: String, default: 'daily' },
    streak: { type: Number, default: 0 },
    completedToday: { type: Boolean, default: false },
    targetDays: { type: Number, default: 7 },
    completionLog: [{ type: String }],
    completedDates: [{ type: String }],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const HabitModel = mongoose.model<IHabitDocument>('Habit', HabitSchema);
