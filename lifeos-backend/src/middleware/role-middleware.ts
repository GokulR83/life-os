import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/app-error-util';

export const restrictTo = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication context is missing.'));
    }

    const userRole = (req.user as any).role || 'USER';
    if (!allowedRoles.includes(userRole)) {
      return next(
        new ForbiddenError(`Your role '${userRole}' does not have permission to access this resource`)
      );
    }

    next();
  };
};
