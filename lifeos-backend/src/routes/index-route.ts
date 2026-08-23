import { Router } from 'express';
import authRouter from './auth-route';
import userRouter from './user-route';
import taskRouter from './task-route';
import habitRouter from './habit-route';
import journalRouter from './journal-route';
import expenseRouter from './expense-route';
import dsaRouter from './dsa-route';
import flashcardRouter from './flashcard-route';
import jobRouter from './job-route';
import projectRouter from './project-route';
import studyRouter from './study-route';
import noteRouter from './note-route';
import resumeRouter from './resume-route';
import dashboardRouter from './dashboard-route';
import notificationRouter from './notification-route';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/tasks', taskRouter);
apiRouter.use('/habits', habitRouter);
apiRouter.use('/journals', journalRouter);
apiRouter.use('/expenses', expenseRouter);
apiRouter.use('/dsa', dsaRouter);
apiRouter.use('/flashcards', flashcardRouter);
apiRouter.use('/jobs', jobRouter);
apiRouter.use('/resumes', resumeRouter);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/study', studyRouter);
apiRouter.use('/notes', noteRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/notifications', notificationRouter);

export default apiRouter;