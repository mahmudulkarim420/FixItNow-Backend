import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../utils/AppError';
import config from '../config';

export const auth = (...requiredRoles: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.accessToken;

      if (!token) {
        throw new AppError(401, 'You are not authorized! Token missing.');
      }

      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        throw new AppError(403, 'You have no permission to access this route!');
      }

      req.user = decoded as JwtPayload;

      next();
    } catch (error) {
      next(error);
    }
  };
};
