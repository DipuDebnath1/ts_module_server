import express from 'express';
import validationRequest from '../../utils/validationRequest';
import auth from '../../../middleware/auth';
import fileUploader from '../../../middleware/fileUpload';
import { AuthController } from './auth.controller';
import AuthValidation from './auth.validation';

const router = express.Router();

// File upload configuration
const UPLOADS_FOLDER = './public/users';
const fileUpload = fileUploader(UPLOADS_FOLDER);

// Authentication routes

// User Registration
router.post(
  '/signup',
  fileUpload.single('image'), // Allow profile image during signup
  validationRequest(AuthValidation.userSignUpValidation),
  AuthController.createUser,
);

// User Login
router.post(
  '/signin',
  validationRequest(AuthValidation.userSignInValidation),
  AuthController.LoginUser,
);

// OTP Verification
router.post(
  '/verify_otp',
  validationRequest(AuthValidation.VerifyOtpValidation),
  AuthController.VerifyOtp,
);

// Forgot Password
router.post(
  '/forgot_password',
  validationRequest(AuthValidation.ForgotPasswordValidation),
  AuthController.ForgotPassword,
);

// Reset Password
router.post(
  '/reset_password',
  validationRequest(AuthValidation.ResetPasswordValidation),
  AuthController.ResetPassword,
);

// update Password
router.post(
  '/update_password',
  validationRequest(AuthValidation.updatePasswordValidation),
  AuthController.UpdatePassword,
);

// User Logout
router.post('/logout', AuthController.LogoutUser);

// Update Password
router.post(
  '/refresh_token',
  validationRequest(AuthValidation.refreshTokenVerification),
  auth('common'),
  AuthController.RefreshUserToken,
);

export const AuthRoute = router;
