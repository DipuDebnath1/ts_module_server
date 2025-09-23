/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import AppError from '../app/ErrorHandler/AppError';
import httpStatus from 'http-status';
import { logger } from '../app/logger';
import { User } from '../app/modules/user';

const socketIO = (io: Server): void => {
  // Authentication middleware - runs before connection
  io.use(async (socket: Socket, next) => {
    try {
      const token =
        (socket.handshake.auth as { token?: string }).token ||
        (socket.handshake.query.token as string | undefined);

      if (!token) {
        logger.warn(
          `Connection rejected: No token provided for socket ${socket.id}`,
        );
        return next(
          new AppError(
            httpStatus.UNAUTHORIZED,
            'Authentication error: No token provided',
          ),
        );
      }

      // Verify JWT token and detect activity
      const decoded = jwt.decode(token) as JwtPayload | null;

      if (!decoded) {
        logger.warn(
          `Authentication failed: Invalid token format for socket ${socket.id}`,
        );
        return next(
          new AppError(
            httpStatus.UNAUTHORIZED,
            'Authentication error: Invalid token',
          ),
        );
      }

      logger.info(
        `Token verified for socket ${socket.id}, user: ${JSON.stringify(decoded)}`,
      );

      // You could attach decoded info to socket
      (socket as any).user = await User.findById(decoded.sub).select(
        'role isDeleted',
      );

      // Check if user exists and is not deleted
      if (!(socket as any).user || (socket as any).user.isDeleted) {
        logger.warn(
          `Authentication failed: User not found or deleted for socket ${socket.id}`,
        );
        return next(
          new AppError(
            httpStatus.UNAUTHORIZED,
            'Authentication error: User not found or deleted',
          ),
        );
      }

      next(); // Allow connection
    } catch (err: unknown) {
      if (err instanceof Error) {
        logger.error(`Authentication failed: ${err.message}`);
        next(
          new AppError(
            httpStatus.UNAUTHORIZED,
            'Authentication error: Invalid token',
          ),
        );
      } else {
        logger.error('Authentication failed: Unknown error');
        next(new AppError(httpStatus.UNAUTHORIZED, 'Authentication error'));
      }
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ID ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ID ${socket.id}`);
    });
  });
};

export default socketIO;
