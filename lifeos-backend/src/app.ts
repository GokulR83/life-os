import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes/index-route';
import { NotFoundError } from './utils/app-error-util';
import { globalErrorHandler } from './middleware/error-middleware';
import { requestLoggerMiddleware } from './middleware/logger-middleware';

const app: Application = express();

// Security, Logging & Parsing Middlewares
app.use(cors());
app.use(requestLoggerMiddleware);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Root health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Life OS API Backend Operational' });
});

// API Routes Mount Point (/api/v1)
app.use('/api/v1', apiRouter);

// Unhandled Route Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Cannot find ${req.originalUrl} on this server!`));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
