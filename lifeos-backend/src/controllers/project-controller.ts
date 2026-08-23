import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler-util';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response-handler-util';
import { socketService } from '../services/socket-service';
import {
  getAllProjectsService,
  createProjectService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService,
} from '../services/project-service';

export const getAllProjects = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const { projects, page, limit, total } = await getAllProjectsService(userId, req.query);
  return sendPaginated(res, projects, page, limit, total, 'Projects retrieved successfully.');
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const project = await createProjectService(userId, req.body);
  socketService.broadcastEntityUpdate('projects', 'create', project);
  return sendCreated(res, project, 'Project created successfully.');
});

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const project = await getProjectByIdService(userId, req.params.id);
  return sendSuccess(res, project, 'Project retrieved successfully.');
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  const project = await updateProjectService(userId, req.params.id, req.body);
  socketService.broadcastEntityUpdate('projects', 'update', project);
  return sendSuccess(res, project, 'Project updated successfully.');
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id!;
  await deleteProjectService(userId, req.params.id);
  socketService.broadcastEntityUpdate('projects', 'delete', { id: req.params.id });
  return sendNoContent(res);
});
