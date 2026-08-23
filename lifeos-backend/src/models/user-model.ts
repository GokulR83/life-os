import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types/user-types';

export interface IUserDocument extends Omit<IUser, '_id' | 'id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
    avatar: { type: String },
    theme: { type: String, default: 'dark' },
    workingStatus: { type: String, default: 'Active Coding' },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    dailyDSAGoal: { type: Number, default: 3 },
    dailyStudyGoalHours: { type: Number, default: 4 },
    notifications: {
      dailyReminder: { type: Boolean, default: true },
      streakWarning: { type: Boolean, default: true },
      jobFollowUps: { type: Boolean, default: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
