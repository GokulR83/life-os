import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler-util';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response-handler-util';
import { socketService } from '../services/socket-service';
import {
  getAllTasksService,
  createTaskService,
  getTaskByIdService,
  updateTaskService,
  deleteTaskService,
  bulkUpdateTasksService,
  bulkDeleteTasksService,
  moveOverdueToTodayService,
} from '../services/task-service';

export const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const { tasks, page, limit, total } = await getAllTasksService(userId, req.query);
  return sendPaginated(res, tasks, page, limit, total, 'Tasks retrieved successfully.');
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const task = await createTaskService(userId, req.body);
  socketService.broadcastEntityUpdate('tasks', 'create', task);
  return sendCreated(res, task, 'Task created successfully.');
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const task = await getTaskByIdService(userId, req.params.id);
  return sendSuccess(res, task, 'Task retrieved successfully.');
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const task = await updateTaskService(userId, req.params.id, req.body);
  socketService.broadcastEntityUpdate('tasks', 'update', task);
  return sendSuccess(res, task, 'Task updated successfully.');
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  await deleteTaskService(userId, req.params.id);
  socketService.broadcastEntityUpdate('tasks', 'delete', { id: req.params.id });
  return sendNoContent(res);
});

export const bulkUpdateTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const { taskIds, updatedFields } = req.body;
  const result = await bulkUpdateTasksService(userId, taskIds || [], updatedFields || {});
  socketService.broadcastEntityUpdate('tasks', 'update', result);
  return sendSuccess(res, result, 'Bulk update completed.');
});

export const bulkDeleteTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const { taskIds } = req.body;
  const result = await bulkDeleteTasksService(userId, taskIds || []);
  socketService.broadcastEntityUpdate('tasks', 'delete', { taskIds });
  return sendSuccess(res, result, 'Bulk delete completed.');
});

export const moveOverdueToToday = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const result = await moveOverdueToTodayService(userId);
  socketService.broadcastEntityUpdate('tasks', 'update', result);
  return sendSuccess(res, result, 'Overdue tasks moved to today.');
});
