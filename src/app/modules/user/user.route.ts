import express from 'express';
import { UserController } from './user.controller';
import validationRequest from '../../utills/validationRequest';
import userValidation from './user.validation';
import auth from '../../../midlewere/auth';
import fileUploader from '../../../midlewere/fileUpload';

const router = express.Router();

// File upload configuration
const UPLOADS_FOLDER = './public/users';
const fileUpload = fileUploader(UPLOADS_FOLDER);

// **********USER ROUTES**********

// Authentication routes
router.post(
  '/signup',
  fileUpload.single('image'), // Allow profile image during signup
  validationRequest(userValidation.userValidationSchema),
  UserController.createUser,
);

router.post(
  '/signin',
  fileUpload.single('image'), // Allow profile image update during login
  validationRequest(userValidation.loginValidationSchema),
  UserController.LoginUser,
);

router.post('/logout', UserController.LogoutUser);

// Profile routes
router.get('/profile', auth('user'), UserController.GetCurrentUser);

router.put(
  '/update-profile',
  auth('user'),
  fileUpload.single('image'),
  validationRequest(userValidation.updateProfileValidationSchema),
  UserController.UpdateUserProfile,
);

// Public user routes
router.get('/:id', auth('user'), UserController.FindSingleUser);

// **********ADMIN ROUTES**********

// User management routes
router.get('/admin/all-users', auth('admin'), UserController.FindAllUser);

router.delete(
  '/admin/delete-user',
  auth('admin'),
  validationRequest(userValidation.userActionValidationSchema),
  UserController.DeleteUserRole,
);

export const UserRoute = router;
