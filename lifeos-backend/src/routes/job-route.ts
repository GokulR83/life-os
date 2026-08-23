import { Router } from 'express';
import { getAllJobs, createJob, getJobById, updateJob, deleteJob, followUpJob } from '../controllers/job-controller';
import { protect } from '../middleware/auth-middleware';
import { validateRequest } from '../middleware/validate-middleware';
import { CreateJobSchema, UpdateJobSchema } from '@lifeos/contracts';

const jobRouter = Router();

jobRouter.use(protect);
jobRouter.get('/', getAllJobs);
jobRouter.post('/', validateRequest(CreateJobSchema), createJob);
jobRouter.get('/:id', getJobById);
jobRouter.put('/:id', validateRequest(UpdateJobSchema), updateJob);
jobRouter.post('/:id/followup', followUpJob);
jobRouter.delete('/:id', deleteJob);

export default jobRouter;
