/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// // fileUpload.js in middlewares
// require("dotenv").config();
// const multer = require("multer");
// const multerS3 = require("multer-s3");
// const path = require("path");
// import s3  from ("../config/aws.config").s3;

// // 🔽 This function is what you're calling as `userFileUploadMiddleware("events")`
// const s3Uploader = (folderName = "others") =>
//   multer({
//     storage: multerS3({
//       s3,
//       bucket: process.env.AWS_S3_BUCKET_NAME,
//       //   acl: "public-read",
//       contentType: multerS3.AUTO_CONTENT_TYPE,
//       key: function (req, file, cb) {
//         const ext = path.extname(file.originalname.trim());
//        // Preserve the original file name while appending a unique identifier
//         const originalName = file.originalname.replace(/\s+/g, '-'); // Replace spaces with dashes (optional, you can customize this)
//         const fileName = `${originalName.replace(ext, '')}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;

//         const fullPath = `${folderName}/${fileName}`;
//         cb(null, fullPath); // 🔁 Upload to S3 path like "events/..."
//       },
//     }),
//     limits: { fileSize: 5 * 1024 * 1024 }, // max allow 5mb
//     fileFilter: (req, file, cb) => {
//       if (
//         file.mimetype === "image/jpg" ||
//         file.mimetype === "image/jpeg" ||
//         file.mimetype === "image/png" ||
//         file.mimetype === "image/heic" ||
//         file.mimetype === "image/heif"
//       ) {
//         cb(null, true);
//       } else {
//         cb(
//           new Error("Only jpg, jpeg, png, heic, and heif formats are allowed!")
//         );
//       }
//     },
//   });

// module.exports = s3Uploader;
import { Request, Response, NextFunction } from 'express';
import multer, { StorageEngine } from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import s3 from '../config/aws.config'; // Import the S3 client instance
import AppError from '../app/ErrorHandler/AppError';
import httpStatus from 'http-status';

// Define the accepted file types for fileFilter
type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

interface FileUploadOptions {
  folderName: string;
}

const s3Uploader = ({ folderName = 'others' }: FileUploadOptions) => {
  // The multer storage engine configuration for S3
  const storage: StorageEngine = multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET_NAME as string,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (
      req: Request,
      file: Express.Multer.File,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      cb: Function,
    ): void {
      const ext = path.extname(file.originalname.trim());
      const originalName = file.originalname.replace(/\s+/g, '-'); // Replace spaces with dashes
      const fileName = `${originalName.replace(ext, '')}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      const fullPath = `${folderName}/${fileName}`;
      cb(null, fullPath); // Upload to S3 path like "events/..."
    },
  });

  // Define multer middleware options
  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // max allowed file size: 5 MB
    fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
      if (
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/heic' ||
        file.mimetype === 'image/heif'
      ) {
        cb(null, true); // Accept the file
      } else {
        cb(
          new AppError(
            httpStatus.BAD_REQUEST,
            'Only jpg, jpeg, png, heic, and heif formats are allowed!',
          ),
          false,
        ); // Reject the file
      }
    },
  });

  return upload;
};

export default s3Uploader;
