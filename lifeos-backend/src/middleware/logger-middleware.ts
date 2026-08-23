import { Request, Response, NextFunction } from 'express';

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusIcon = statusCode >= 400 ? '❌' : '✅';

    console.log(`${statusIcon} [HTTP] ${method} ${originalUrl} ${statusCode} - ${duration}ms`);
  });

  next();
};
