/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../app/utills/catchAsync';
import AppError from '../app/ErrorHandler/AppError';
import httpStatus from 'http-status';
import { tokenDecoded } from '../app/utills/tokenDecoded';

// verifyUser;
export const verifyUser = () => {
  return catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .json({ message: 'Authorization token missing or incorrect format' });
      }

      const decoded = tokenDecoded(authHeader);

      if (!decoded) {
        new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized, missing token');
      }
      if (decoded?.data.role === 'user' || decoded?.data.role === 'admin') {
        next();
      } else {
        res.status(httpStatus.UNAUTHORIZED).json({
          statusCode: httpStatus.UNAUTHORIZED,
          success: false,
          message: 'You have no access to this route',
        });
      }
    },
  );
};

// verifyAdmin;
export const verifyAdmin = () => {
  return catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .json({ message: 'Authorization token missing or incorrect format' });
      }

      const decoded = tokenDecoded(authHeader);
      if (!decoded) {
        new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized, missing token');
      }
      if (decoded?.data.role === 'admin') {
        next();
      } else {
        res.status(httpStatus.UNAUTHORIZED).json({
          statusCode: httpStatus.UNAUTHORIZED,
          success: false,
          message: 'You have no access to this route',
        });
      }
    },
  );
};
// verifyLoginUser;
export const verifyLoginUser = () => {
  return catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .json({ message: 'Authorization token missing or incorrect format' });
      }

      const decoded = tokenDecoded(authHeader);
      if (!decoded) {
        new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized, missing token');
      }
      if (decoded?.data.role === 'admin' || decoded?.data.role === 'user') {
        next();
      } else {
        res.status(httpStatus.UNAUTHORIZED).json({
          statusCode: httpStatus.UNAUTHORIZED,
          success: false,
          message: 'You have no access to this route',
        });
      }
    },
  );
};
