import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/async-handler-util';
import { verifyToken } from '../utils/jwt-util';
import { UserModel } from '../models/user-model';
import { UnauthorizedError } from '../utils/app-error-util';
import { UserRole } from '../types/user-types';

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new UnauthorizedError('You are not logged in. Please provide a valid Bearer token.');
  }

  const decoded = verifyToken(token);

  const currentUser = await UserModel.findById(decoded.id);
  if (!currentUser) {
    throw new UnauthorizedError('The user belonging to this token no longer exists.');
  }

  if (!currentUser.isActive) {
    throw new UnauthorizedError('Your account has been deactivated.');
  }

  const userObject = currentUser.toObject();
  delete userObject.password;
  req.user = {
    ...userObject,
    _id: currentUser._id.toString(),
  };

  next();
});
