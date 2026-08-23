import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  exportUserData,
  importUserData,
  resetUserData,
} from '../controllers/user-controller';
import { protect } from '../middleware/auth-middleware';
import { validateRequest } from '../middleware/validate-middleware';
import { UpdateProfileSchema } from '@lifeos/contracts';

const userRouter = Router();

userRouter.use(protect);
userRouter.get('/export', exportUserData);
userRouter.post('/import', importUserData);
userRouter.post('/reset', resetUserData);
userRouter.get('/', getAllUsers);
userRouter.get('/:id', getUserById);
userRouter.put('/:id', validateRequest(UpdateProfileSchema), updateUser);

export default userRouter;
