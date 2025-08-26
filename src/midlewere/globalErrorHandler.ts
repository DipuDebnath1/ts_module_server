/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

const globalErrorHandler :ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
):void => {
  const statusCode = (err as any).statusCode || 500;
  const message = (err as any).message || 'something went wrong';

   res.status(statusCode).json({
    success: false,
    message,
    error: err,
  });
};
export default globalErrorHandler;
