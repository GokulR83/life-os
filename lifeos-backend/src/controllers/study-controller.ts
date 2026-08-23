import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler-util';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response-handler-util';
import { socketService } from '../services/socket-service';
import {
  getAllStudySessionsService,
  createStudySessionService,
  getStudySessionByIdService,
  updateStudySessionService,
  deleteStudySessionService,
} from '../services/study-service';

export const getAllStudySessions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const { sessions, page, limit, total } = await getAllStudySessionsService(userId, req.query);
  return sendPaginated(res, sessions, page, limit, total, 'Study sessions retrieved successfully.');
});

export const createStudySession = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const session = await createStudySessionService(userId, req.body);
  socketService.broadcastEntityUpdate('study', 'create', session);
  return sendCreated(res, session, 'Study session logged successfully.');
});

export const getStudySessionById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const session = await getStudySessionByIdService(userId, req.params.id);
  return sendSuccess(res, session, 'Study session retrieved successfully.');
});

export const updateStudySession = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const session = await updateStudySessionService(userId, req.params.id, req.body);
  socketService.broadcastEntityUpdate('study', 'update', session);
  return sendSuccess(res, session, 'Study session updated successfully.');
});

export const deleteStudySession = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  await deleteStudySessionService(userId, req.params.id);
  socketService.broadcastEntityUpdate('study', 'delete', { id: req.params.id });
  return sendNoContent(res);
});
