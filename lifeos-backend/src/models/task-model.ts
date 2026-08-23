import mongoose, { Schema, Document } from 'mongoose';
import { ITask } from '../types/task-types';

export interface ITaskDocument extends Omit<ITask, '_id' | 'id'>, Document {}

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, default: 'Todo' },
    priority: { type: String, default: 'Medium' },
    category: { type: String, default: 'General' },
    deadline: { type: String },
    dueDate: { type: String },
    estimatedMinutes: { type: Number, default: 30 },
    completed: { type: Boolean, default: false },
    completedAt: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const TaskModel = mongoose.model<ITaskDocument>('Task', TaskSchema);
