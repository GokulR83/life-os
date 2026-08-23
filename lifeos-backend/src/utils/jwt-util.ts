import jwt from 'jsonwebtoken';
import { envConfig } from '../config/environment-config';

export interface JwtPayload {
  id: string;
  email: string;
  role?: string;
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, envConfig.jwtSecret, {
    expiresIn: envConfig.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, envConfig.jwtSecret) as JwtPayload;
};
