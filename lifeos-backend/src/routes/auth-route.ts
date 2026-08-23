import { Router } from 'express';
import { register, login, logout, getMe, updateProfile } from '../controllers/auth-controller';
import { protect } from '../middleware/auth-middleware';
import { validateRequest } from '../middleware/validate-middleware';
import { LoginSchema, RegisterSchema, UpdateProfileSchema } from '@lifeos/contracts';

const authRouter = Router();

authRouter.post('/register', validateRequest(RegisterSchema), register);
authRouter.post('/login', validateRequest(LoginSchema), login);
authRouter.post('/logout', protect, logout);
authRouter.get('/me', protect, getMe);
authRouter.put('/profile', protect, validateRequest(UpdateProfileSchema), updateProfile);
authRouter.patch('/profile', protect, validateRequest(UpdateProfileSchema), updateProfile);

export default authRouter;
