import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler-util';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response-handler-util';
import { socketService } from '../services/socket-service';
import {
  getAllExpensesService,
  createExpenseService,
  getExpenseByIdService,
  updateExpenseService,
  deleteExpenseService,
} from '../services/expense-service';

export const getAllExpenses = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const { expenses, page, limit, total } = await getAllExpensesService(userId, req.query);
  return sendPaginated(res, expenses, page, limit, total, 'Expenses retrieved successfully.');
});

export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const expense = await createExpenseService(userId, req.body);
  socketService.broadcastEntityUpdate('expenses', 'create', expense);
  return sendCreated(res, expense, 'Expense recorded successfully.');
});

export const getExpenseById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const expense = await getExpenseByIdService(userId, req.params.id);
  return sendSuccess(res, expense, 'Expense retrieved successfully.');
});

export const updateExpense = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const expense = await updateExpenseService(userId, req.params.id, req.body);
  socketService.broadcastEntityUpdate('expenses', 'update', expense);
  return sendSuccess(res, expense, 'Expense updated successfully.');
});

export const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  await deleteExpenseService(userId, req.params.id);
  socketService.broadcastEntityUpdate('expenses', 'delete', { id: req.params.id });
  return sendNoContent(res);
});
