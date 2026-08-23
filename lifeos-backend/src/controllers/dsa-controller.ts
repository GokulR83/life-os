import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler-util';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response-handler-util';
import { socketService } from '../services/socket-service';
import {
  getAllDsaService,
  createDsaService,
  getDsaByIdService,
  updateDsaService,
  deleteDsaService,
} from '../services/dsa-service';

export const getAllDsa = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const { dsaProblems, page, limit, total } = await getAllDsaService(userId, req.query);
  return sendPaginated(res, dsaProblems, page, limit, total, 'DSA problems retrieved successfully.');
});

export const createDsa = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const problem = await createDsaService(userId, req.body);
  socketService.broadcastEntityUpdate('dsa', 'create', problem);
  return sendCreated(res, problem, 'DSA problem added successfully.');
});

export const getDsaById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const problem = await getDsaByIdService(userId, req.params.id);
  return sendSuccess(res, problem, 'DSA problem retrieved successfully.');
});

export const updateDsa = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const problem = await updateDsaService(userId, req.params.id, req.body);
  socketService.broadcastEntityUpdate('dsa', 'update', problem);
  return sendSuccess(res, problem, 'DSA problem updated successfully.');
});

export const deleteDsa = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  await deleteDsaService(userId, req.params.id);
  socketService.broadcastEntityUpdate('dsa', 'delete', { id: req.params.id });
  return sendNoContent(res);
});
