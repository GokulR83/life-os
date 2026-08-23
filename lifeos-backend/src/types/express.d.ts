import { IUser } from './user-types';

declare global {
  namespace Express {
    interface Request {
      user?: Omit<IUser, 'password'>;
    }
  }
}
