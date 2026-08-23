import mongoose, { Schema, Document } from 'mongoose';
import { IFlashcard } from '../types/flashcard-types';

export interface IFlashcardDocument extends Omit<IFlashcard, '_id' | 'id'>, Document {}

const FlashcardSchema = new Schema<IFlashcardDocument>(
  {
    question: { type: String, trim: true },
    front: { type: String, trim: true },
    answer: { type: String, trim: true },
    back: { type: String, trim: true },
    pattern: { type: String, default: 'Two Pointers', trim: true },
    codeSnippet: { type: String, trim: true },
    explanation: { type: String, trim: true },
    difficulty: { type: String, default: 'Medium' },
    needsRevision: { type: Boolean, default: true },
    isAiGenerated: { type: Boolean, default: false },
    lastReviewed: { type: String },
    easeFactor: { type: Number, default: 2.5 },
    efactor: { type: Number, default: 2.5 },
    interval: { type: Number, default: 1 },
    repetitions: { type: Number, default: 0 },
    repetition: { type: Number, default: 0 },
    nextReviewDate: { type: String },
    nextReview: { type: String },
    noteId: { type: Schema.Types.ObjectId, ref: 'Note', index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const FlashcardModel = mongoose.model<IFlashcardDocument>('Flashcard', FlashcardSchema);
