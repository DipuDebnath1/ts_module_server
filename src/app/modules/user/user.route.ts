import express from 'express';
import { UserController } from './user.controller';
import validationRequest from '../../utils/validationRequest';
import userValidation from './user.validation';
import fileUploader from '../../../middleware/fileUpload';
import auth from '../../../middleware/auth';

const router = express.Router();

// File upload configuration
const UPLOADS_FOLDER = './public/users';
const fileUpload = fileUploader(UPLOADS_FOLDER);

// **********USER ROUTES**********

// Profile routes

router.get('/self-profile', auth('common'), UserController.GetSelfProfile);

router.put(
  '/update-profile',
  auth('common'),
  fileUpload.single('image'),
  validationRequest(userValidation.updateProfileValidation),
  UserController.UpdateUserProfile,
);

export const UserRoute = router;
