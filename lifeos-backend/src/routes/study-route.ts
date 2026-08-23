import { Router } from 'express';
import { getAllStudySessions, createStudySession, getStudySessionById, updateStudySession, deleteStudySession } from '../controllers/study-controller';
import { protect } from '../middleware/auth-middleware';
import { validateRequest } from '../middleware/validate-middleware';
import { CreateStudySessionSchema, UpdateStudySessionSchema } from '@lifeos/contracts';

const studyRouter = Router();

studyRouter.use(protect);
studyRouter.get('/', getAllStudySessions);
studyRouter.post('/', validateRequest(CreateStudySessionSchema), createStudySession);
studyRouter.get('/:id', getStudySessionById);
studyRouter.put('/:id', validateRequest(UpdateStudySessionSchema), updateStudySession);
studyRouter.delete('/:id', deleteStudySession);

export default studyRouter;
