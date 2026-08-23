import { ExpenseModel } from '../models/expense-model';
import { IExpense } from '../types/expense-types';
import { NotFoundError, BadRequestError } from '../utils/app-error-util';

export const getAllExpensesService = async (userId: string, query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '100', 10);
  const skip = (page - 1) * limit;

  const filter: any = { userId };
  if (query.category) filter.category = query.category;
  if (query.type) filter.type = query.type;
  if (query.month) filter.date = { $regex: `^${query.month}` };
  if (query.search) filter.title = { $regex: query.search, $options: 'i' };

  const [expenses, total] = await Promise.all([
    ExpenseModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ExpenseModel.countDocuments(filter),
  ]);

  const sanitizedExpenses = expenses.map((e) => {
    const obj = e.toObject();
    return { ...obj, _id: e._id.toString(), id: e._id.toString() };
  });

  return { expenses: sanitizedExpenses, page, limit, total };
};

export const createExpenseService = async (userId: string, payload: Partial<IExpense>): Promise<IExpense> => {
  const title = (payload.title || payload.description || 'Expense').trim();
  const description = (payload.description || payload.title || 'Expense').trim();
  if (payload.amount === undefined || payload.amount === null) {
    throw new BadRequestError('Expense amount is required.');
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const newExpense = await ExpenseModel.create({
    ...payload,
    title,
    description,
    amount: Number(payload.amount),
    category: payload.category || 'General',
    paymentMethod: payload.paymentMethod || 'Credit Card',
    date: payload.date || todayStr,
    userId,
  });

  const obj = newExpense.toObject();
  return { ...obj, _id: newExpense._id.toString(), id: newExpense._id.toString() };
};

export const getExpenseByIdService = async (userId: string, id: string): Promise<IExpense> => {
  const expense = await ExpenseModel.findOne({ _id: id, userId });
  if (!expense) {
    throw new NotFoundError(`Expense record not found with ID: ${id}`);
  }

  const obj = expense.toObject();
  return { ...obj, _id: expense._id.toString(), id: expense._id.toString() };
};

export const updateExpenseService = async (userId: string, id: string, payload: Partial<IExpense>): Promise<IExpense> => {
  const expense = await ExpenseModel.findOneAndUpdate({ _id: id, userId }, payload, {
    new: true,
    runValidators: true,
  });

  if (!expense) {
    throw new NotFoundError(`Expense record not found with ID: ${id}`);
  }

  const obj = expense.toObject();
  return { ...obj, _id: expense._id.toString(), id: expense._id.toString() };
};

export const deleteExpenseService = async (userId: string, id: string): Promise<void> => {
  const expense = await ExpenseModel.findOneAndDelete({ _id: id, userId });
  if (!expense) {
    throw new NotFoundError(`Expense record not found with ID: ${id}`);
  }
};
