import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler-util';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response-handler-util';
import { socketService } from '../services/socket-service';
import {
  getAllJobsService,
  createJobService,
  getJobByIdService,
  updateJobService,
  deleteJobService,
  followUpJobService,
} from '../services/job-service';

export const getAllJobs = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const { jobs, page, limit, total } = await getAllJobsService(userId, req.query);
  return sendPaginated(res, jobs, page, limit, total, 'Job applications retrieved successfully.');
});

export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const job = await createJobService(userId, req.body);
  socketService.broadcastEntityUpdate('jobs', 'create', job);
  return sendCreated(res, job, 'Job application recorded successfully.');
});

export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const job = await getJobByIdService(userId, req.params.id);
  return sendSuccess(res, job, 'Job application retrieved successfully.');
});

export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const job = await updateJobService(userId, req.params.id, req.body);
  socketService.broadcastEntityUpdate('jobs', 'update', job);
  return sendSuccess(res, job, 'Job application updated successfully.');
});

export const followUpJob = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const job = await followUpJobService(userId, req.params.id);
  socketService.broadcastEntityUpdate('jobs', 'update', job);
  return sendSuccess(res, job, 'Follow-up logged successfully.');
});

export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  await deleteJobService(userId, req.params.id);
  socketService.broadcastEntityUpdate('jobs', 'delete', { id: req.params.id });
  return sendNoContent(res);
});

