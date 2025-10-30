/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';
import httpStatus from 'http-status';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import AppError from '../../app/ErrorHandler/AppError';

// Define the type for the UPLOADS_FOLDER parameter

// const localFileUploadDestination = `./public`;
const localFileUploadDestination = `./public`;

export default function (UPLOADS_FOLDER: string): multer.Multer {
  // Define storage configuration for multer using diskStorage
  const storage: StorageEngine = multer.diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ) => {
      cb(null, `${localFileUploadDestination}/${UPLOADS_FOLDER}`);
    },
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const fileExt = path.extname(file.originalname);
      const filename =
        file.originalname
          .replace(fileExt, '')
          .toLowerCase() // Fixed typo: toLocaleLowerCase -> toLowerCase
          .split(' ')
          .join('-') +
        '-' +
        Date.now();

      cb(null, filename + fileExt); // Final filename with extension
    },
  });

  // Define multer middleware options
  const upload = multer({
    storage,
    limits: {
      fileSize: 1024 * 1024 * 20, // Max allowed file size: 20MB
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
      if (
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/heic' ||
        file.mimetype === 'image/heif'
      ) {
        cb(null, true); // Accept the file
      } else {
        cb(
          new AppError(
            httpStatus.BAD_REQUEST,
            'Only jpg, png, jpeg, heic, heif formats are allowed!',
          ),
          false,
        ); // Reject the file
      }
    },
  });

  return upload; // Return the configured multer upload middleware
}
