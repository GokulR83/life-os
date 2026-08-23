import mongoose, { Schema, Document } from 'mongoose';
import { INote } from '../types/note-types';

export interface INoteDocument extends Omit<INote, '_id' | 'id'>, Document {}

const NoteSchema = new Schema<INoteDocument>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    folder: { type: String, default: 'General' },
    category: { type: String, default: 'General' },
    pinned: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    tags: [{ type: String }],
    date: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const NoteModel = mongoose.model<INoteDocument>('Note', NoteSchema);
