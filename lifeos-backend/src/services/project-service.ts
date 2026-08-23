import { ProjectModel } from '../models/project-model';
import { TaskModel } from '../models/task-model';
import { IProject } from '../types/project-types';
import { NotFoundError, BadRequestError } from '../utils/app-error-util';

export const getAllProjectsService = async (userId: string, query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '100', 10);
  const skip = (page - 1) * limit;

  const filter: any = { userId };
  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;

  const [projects, total] = await Promise.all([
    ProjectModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ProjectModel.countDocuments(filter),
  ]);

  const sanitizedProjects = await Promise.all(
    projects.map(async (p) => {
      const obj = p.toObject();
      const pId = p._id.toString();

      const [totalTasks, completedTasks] = await Promise.all([
        TaskModel.countDocuments({ userId, projectId: p._id }),
        TaskModel.countDocuments({ userId, projectId: p._id, completed: true }),
      ]);

      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...obj,
        _id: pId,
        id: pId,
        title: p.title || p.name || 'Untitled Project',
        name: p.name || p.title || 'Untitled Project',
        dueDate: p.dueDate || (p as any).deadline || '2026-09-01',
        deadline: p.dueDate || (p as any).deadline || '2026-09-01',
        techStack: p.techStack && p.techStack.length ? p.techStack : ['React', 'TypeScript'],
        tasksCount: totalTasks,
        completedTasksCount: completedTasks,
        progress,
      };
    })
  );

  return { projects: sanitizedProjects, page, limit, total };
};

export const createProjectService = async (userId: string, payload: Partial<IProject>): Promise<IProject> => {
  const title = payload.title || payload.name;
  if (!title) {
    throw new BadRequestError('Project title/name is required.');
  }

  const newProject = await ProjectModel.create({
    ...payload,
    title,
    name: title,
    userId,
  });

  const obj = newProject.toObject();
  return {
    ...obj,
    _id: newProject._id.toString(),
    id: newProject._id.toString(),
    progress: 0,
    tasksCount: 0,
    completedTasksCount: 0,
  };
};

export const getProjectByIdService = async (userId: string, id: string): Promise<IProject> => {
  const project = await ProjectModel.findOne({ _id: id, userId });
  if (!project) {
    throw new NotFoundError(`Project not found with ID: ${id}`);
  }

  const [totalTasks, completedTasks] = await Promise.all([
    TaskModel.countDocuments({ userId, projectId: project._id }),
    TaskModel.countDocuments({ userId, projectId: project._id, completed: true }),
  ]);

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const obj = project.toObject();

  return {
    ...obj,
    _id: project._id.toString(),
    id: project._id.toString(),
    tasksCount: totalTasks,
    completedTasksCount: completedTasks,
    progress,
  };
};

export const updateProjectService = async (userId: string, id: string, payload: Partial<IProject>): Promise<IProject> => {
  if (payload.title && !payload.name) payload.name = payload.title;
  if (payload.name && !payload.title) payload.title = payload.name;

  const project = await ProjectModel.findOneAndUpdate({ _id: id, userId }, payload, {
    new: true,
    runValidators: true,
  });

  if (!project) {
    throw new NotFoundError(`Project not found with ID: ${id}`);
  }

  const obj = project.toObject();
  return { ...obj, _id: project._id.toString(), id: project._id.toString() };
};

export const deleteProjectService = async (userId: string, id: string): Promise<void> => {
  const project = await ProjectModel.findOneAndDelete({ _id: id, userId });
  if (!project) {
    throw new NotFoundError(`Project not found with ID: ${id}`);
  }
};
