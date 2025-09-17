/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from '../app/logger';

// send notification to specific user
export const sendSocketNotification = (userId: string, notification: any) => {
  try {
    const roomId = `notification::${userId}`;
    io.emit(roomId, notification);
  } catch (error) {
    logger.error(
      `socket notification Unexpected error: ${JSON.stringify(error)}`,
    );
  }
};
