import { Router } from 'express';
import {
  getAllHabits,
  createHabit,
  getHabitById,
  updateHabit,
  toggleHabit,
  deleteHabit,
} from '../controllers/habit-controller';
import { protect } from '../middleware/auth-middleware';
import { validateRequest } from '../middleware/validate-middleware';
import { CreateHabitSchema, UpdateHabitSchema } from '@lifeos/contracts';

const habitRouter = Router();

habitRouter.use(protect);
habitRouter.get('/', getAllHabits);
habitRouter.post('/', validateRequest(CreateHabitSchema), createHabit);
habitRouter.patch('/:id/toggle', toggleHabit);
habitRouter.get('/:id', getHabitById);
habitRouter.put('/:id', validateRequest(UpdateHabitSchema), updateHabit);
habitRouter.delete('/:id', deleteHabit);

export default habitRouter;
