import { Router } from 'express';
import {
  getAllTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  bulkUpdateTasks,
  bulkDeleteTasks,
  moveOverdueToToday,
} from '../controllers/task-controller';
import { protect } from '../middleware/auth-middleware';
import { validateRequest } from '../middleware/validate-middleware';
import { CreateTaskSchema, UpdateTaskSchema, BulkUpdateTasksSchema } from '@lifeos/contracts';

const taskRouter = Router();

taskRouter.use(protect);
taskRouter.get('/', getAllTasks);
taskRouter.post('/', validateRequest(CreateTaskSchema), createTask);
taskRouter.post('/bulk-update', validateRequest(BulkUpdateTasksSchema), bulkUpdateTasks);
taskRouter.post('/bulk-delete', bulkDeleteTasks);
taskRouter.post('/move-overdue-today', moveOverdueToToday);
taskRouter.get('/:id', getTaskById);
taskRouter.put('/:id', validateRequest(UpdateTaskSchema), updateTask);
taskRouter.delete('/:id', deleteTask);

export default taskRouter;
