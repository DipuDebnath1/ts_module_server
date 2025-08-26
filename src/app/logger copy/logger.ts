import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const { combine, timestamp, printf, errors, colorize } = format;

// Custom format: only level + message + stack
const logFormat = printf(({ level, message, stack, timestamp }) => {
  // Optional: include timestamp in file only
  return stack
    ? `[${level}] ${stack}`
    : `[${level}] ${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(errors({ stack: true })), // Keep stack traces
  transports: [
    // Daily rotated error file
    // new DailyRotateFile({
    //   filename: path.join("logs", "error-%DATE%.log"),
    //   datePattern: "YYYY-MM-DD",
    //   level: "error",
    //   format: combine(timestamp(), errors({ stack: true }), logFormat),
    // }),
    // Daily rotated combined file
    new DailyRotateFile({
      filename: path.join("logs", "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      format: combine(timestamp(), errors({ stack: true }), logFormat),
    }),
    // Console transport (plain text, no extra JSON metadata)
    new transports.Console({
      format: combine(colorize(), errors({ stack: true }), logFormat),
    }),
  ],
});

export default logger;