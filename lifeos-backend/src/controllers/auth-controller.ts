import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler-util';
import { sendSuccess, sendCreated } from '../utils/response-handler-util';
import { registerUserService, loginUserService, getMeService, updateProfileService } from '../services/auth-service';
import { UnauthorizedError } from '../utils/app-error-util';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUserService(req.body);
  return sendCreated(res, result, 'User registered successfully.');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUserService(req.body);
  return sendSuccess(res, result, 'Login successful.');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, { success: true }, 'Signed out successfully.');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user._id) {
    throw new UnauthorizedError('User authentication context is missing.');
  }

  const user = await getMeService(req.user._id);
  return sendSuccess(res, user, 'User profile retrieved successfully.');
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user._id) {
    throw new UnauthorizedError('User authentication context is missing.');
  }

  const user = await updateProfileService(req.user._id, req.body);
  return sendSuccess(res, user, 'Profile updated successfully.');
});
