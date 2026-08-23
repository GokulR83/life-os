import { Router } from 'express';
import { getAllExpenses, createExpense, getExpenseById, updateExpense, deleteExpense } from '../controllers/expense-controller';
import { protect } from '../middleware/auth-middleware';
import { validateRequest } from '../middleware/validate-middleware';
import { CreateExpenseSchema, UpdateExpenseSchema } from '@lifeos/contracts';

const expenseRouter = Router();

expenseRouter.use(protect);
expenseRouter.get('/', getAllExpenses);
expenseRouter.post('/', validateRequest(CreateExpenseSchema), createExpense);
expenseRouter.get('/:id', getExpenseById);
expenseRouter.put('/:id', validateRequest(UpdateExpenseSchema), updateExpense);
expenseRouter.delete('/:id', deleteExpense);

export default expenseRouter;
