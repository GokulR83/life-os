import { Router } from 'express';
import { getAllResumes, createResume, getResumeById, updateResume, deleteResume } from '../controllers/resume-controller';
import { protect } from '../middleware/auth-middleware';

const resumeRouter = Router();

resumeRouter.use(protect);
resumeRouter.get('/', getAllResumes);
resumeRouter.post('/', createResume);
resumeRouter.get('/:id', getResumeById);
resumeRouter.put('/:id', updateResume);
resumeRouter.delete('/:id', deleteResume);

export default resumeRouter;
