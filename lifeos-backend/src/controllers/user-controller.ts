import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler-util';
import { sendSuccess, sendPaginated } from '../utils/response-handler-util';
import {
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  exportUserDataService,
  importUserDataService,
  resetUserDataService,
} from '../services/user-service';

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { users, page, limit, total } = await getAllUsersService(req.query);
  return sendPaginated(res, users, page, limit, total, 'Users retrieved successfully.');
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await getUserByIdService(req.params.id);
  return sendSuccess(res, user, 'User retrieved successfully.');
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await updateUserService(req.params.id, req.body);
  return sendSuccess(res, user, 'User profile updated successfully.');
});

export const exportUserData = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const data = await exportUserDataService(userId);
  return sendSuccess(res, data, 'User data exported successfully.');
});

export const importUserData = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const result = await importUserDataService(userId, req.body);
  return sendSuccess(res, result, 'User data imported successfully.');
});

export const resetUserData = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const result = await resetUserDataService(userId);
  return sendSuccess(res, result, 'User data reset successfully.');
});
