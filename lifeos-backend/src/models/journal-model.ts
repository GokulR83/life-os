import mongoose, { Schema, Document } from 'mongoose';
import { IJournalEntry } from '../types/journal-types';

export interface IJournalDocument extends Omit<IJournalEntry, '_id' | 'id'>, Document {}

const JournalSchema = new Schema<IJournalDocument>(
  {
    title: { type: String, trim: true },
    content: { type: String, trim: true },
    date: { type: String, required: true },
    mood: { type: String, default: 'Neutral' },
    moodLabel: { type: String, trim: true },
    entry: { type: String, trim: true },
    wins: [{ type: String }],
    keyWins: [{ type: String }],
    blockers: [{ type: String }],
    challenges: [{ type: String }],
    highlight: { type: String, trim: true },
    reflection: { type: String, trim: true },
    gratitude: { type: String, trim: true },
    energyLevel: { type: Number, default: 3 },
    tags: [{ type: String }],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const JournalModel = mongoose.model<IJournalDocument>('Journal', JournalSchema);
