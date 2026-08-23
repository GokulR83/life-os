import { Router } from 'express';
import { getAllDsa, createDsa, getDsaById, updateDsa, deleteDsa } from '../controllers/dsa-controller';
import { protect } from '../middleware/auth-middleware';
import { validateRequest } from '../middleware/validate-middleware';
import { CreateDsaSchema, UpdateDsaSchema } from '@lifeos/contracts';

const dsaRouter = Router();

dsaRouter.use(protect);
dsaRouter.get('/', getAllDsa);
dsaRouter.post('/', validateRequest(CreateDsaSchema), createDsa);
dsaRouter.get('/:id', getDsaById);
dsaRouter.put('/:id', validateRequest(UpdateDsaSchema), updateDsa);
dsaRouter.delete('/:id', deleteDsa);

export default dsaRouter;
