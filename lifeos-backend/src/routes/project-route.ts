import { Router } from 'express';
import { getAllProjects, createProject, getProjectById, updateProject, deleteProject } from '../controllers/project-controller';
import { protect } from '../middleware/auth-middleware';
import { validateRequest } from '../middleware/validate-middleware';
import { CreateProjectSchema, UpdateProjectSchema } from '@lifeos/contracts';

const projectRouter = Router();

projectRouter.use(protect);
projectRouter.get('/', getAllProjects);
projectRouter.post('/', validateRequest(CreateProjectSchema), createProject);
projectRouter.get('/:id', getProjectById);
projectRouter.put('/:id', validateRequest(UpdateProjectSchema), updateProject);
projectRouter.delete('/:id', deleteProject);

export default projectRouter;
