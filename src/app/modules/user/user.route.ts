import express from 'express';
import { UserController } from './user.controller';
import validationRequest from '../../utils/validationRequest';
import userValidation from './user.validation';
import auth from '../../../middleware/auth';
import fileUploader from '../../../middleware/fileUpload/fileUploader';

const router = express.Router();

// File upload configuration
const fileUpload = fileUploader('users');

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
