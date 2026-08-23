import mongoose, { Schema, Document } from 'mongoose';
import { IProject } from '../types/project-types';

export interface IProjectDocument extends Omit<IProject, '_id' | 'id'>, Document {}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    title: { type: String, trim: true },
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    category: { type: String, default: 'General' },
    status: { type: String, default: 'In Progress' },
    dueDate: { type: String },
    techStack: [{ type: String }],
    githubUrl: { type: String, trim: true },
    demoUrl: { type: String, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const ProjectModel = mongoose.model<IProjectDocument>('Project', ProjectSchema);
