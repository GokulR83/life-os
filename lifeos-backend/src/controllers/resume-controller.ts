import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler-util';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response-handler-util';
import {
  getAllResumesService,
  createResumeService,
  getResumeByIdService,
  updateResumeService,
  deleteResumeService,
} from '../services/resume-service';

export const getAllResumes = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const resumes = await getAllResumesService(userId);
  return sendSuccess(res, resumes, 'Resume versions retrieved successfully.');
});

export const createResume = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const resume = await createResumeService(userId, req.body);
  return sendCreated(res, resume, 'Resume version recorded successfully.');
});

export const getResumeById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const resume = await getResumeByIdService(userId, req.params.id);
  return sendSuccess(res, resume, 'Resume version retrieved successfully.');
});

export const updateResume = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const resume = await updateResumeService(userId, req.params.id, req.body);
  return sendSuccess(res, resume, 'Resume version updated successfully.');
});

export const deleteResume = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  await deleteResumeService(userId, req.params.id);
  return sendNoContent(res);
});
