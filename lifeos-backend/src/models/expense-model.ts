import mongoose, { Schema, Document } from 'mongoose';
import { IExpense } from '../types/expense-types';

export interface IExpenseDocument extends Omit<IExpense, '_id' | 'id'>, Document {}

const ExpenseSchema = new Schema<IExpenseDocument>(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    amount: { type: Number, required: true },
    category: { type: String, default: 'General' },
    type: { type: String, default: 'expense' },
    paymentMethod: { type: String, default: 'Credit Card' },
    date: { type: String },
    tags: [{ type: String }],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const ExpenseModel = mongoose.model<IExpenseDocument>('Expense', ExpenseSchema);
