import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler-util';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response-handler-util';
import { socketService } from '../services/socket-service';
import {
  getAllHabitsService,
  createHabitService,
  getHabitByIdService,
  updateHabitService,
  toggleHabitService,
  deleteHabitService,
} from '../services/habit-service';

export const getAllHabits = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const { habits, page, limit, total } = await getAllHabitsService(userId, req.query);
  return sendPaginated(res, habits, page, limit, total, 'Habits retrieved successfully.');
});

export const createHabit = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const habit = await createHabitService(userId, req.body);
  socketService.broadcastEntityUpdate('habits', 'create', habit);
  return sendCreated(res, habit, 'Habit created successfully.');
});

export const getHabitById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const habit = await getHabitByIdService(userId, req.params.id);
  return sendSuccess(res, habit, 'Habit retrieved successfully.');
});

export const updateHabit = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const habit = await updateHabitService(userId, req.params.id, req.body);
  socketService.broadcastEntityUpdate('habits', 'update', habit);
  return sendSuccess(res, habit, 'Habit updated successfully.');
});

export const toggleHabit = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const dateStr = req.body?.date;
  const habit = await toggleHabitService(userId, req.params.id, dateStr);
  socketService.broadcastEntityUpdate('habits', 'update', habit);
  return sendSuccess(res, habit, 'Habit toggled successfully.');
});

export const deleteHabit = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  await deleteHabitService(userId, req.params.id);
  socketService.broadcastEntityUpdate('habits', 'delete', { id: req.params.id });
  return sendNoContent(res);
});
