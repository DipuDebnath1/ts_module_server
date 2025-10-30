/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';
import AppError from '../../ErrorHandler/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import {
  generateAuthTokens,
  invalidateUserAuthToken,
  refreshUserAuthToken,
} from '../tokens/token.service';
import { TUser, User, UserServices } from '../user';
import { AuthServices } from './auth.service';
import BaseService from '../../../service/DBService';
import generateOtp from '../../utils/genarateOtp';
import { sendOtpVerificationMail } from '../../../config/mailService/sendOtp';
import { ImageUrl } from '../../utils/urlAddInUploadedImage';

const UserService = new BaseService<TUser>(User);

// Create User
const createUser: RequestHandler = catchAsync(async (req, res, next) => {
  // Handle file upload if present
  const userData: TUser = req.body;
  const DateTimeFormat = new Date(req.body.dateOfBirth);
  const date = DateTimeFormat.getTime();
  if (isNaN(date))
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid date format for dateOfBirth',
    );

  if (req.file) userData.image = ImageUrl(req.file); // Store the uploaded file name

  // const result = await UserServices.createUserIntoDB(userData);
  const { email } = req.body;
  const isUser = await UserService.findOne({ filters: { email } });
  let result;

  if (isUser) {
    if (isUser.isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'User is deleted');
    } else if (!isUser.isEmailVerified) {
      result = await UserServices.isUpdateUser(isUser.id, { ...req.body });
    }

    // User already not exists create new user
  } else {
    const code = generateOtp();
    userData.oneTimeCode = Number(code);
    const result = await UserService.create(userData);
    sendOtpVerificationMail(result.email, code);
    // return res;
  }

  // send response
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'please verify OTP sent to email',
    success: true,
    data:
      config.node === 'production'
        ? undefined
        : { oneTimeCode: result?.oneTimeCode || null },
  });
});

// Login User
const LoginUser: RequestHandler = catchAsync(async (req, res, next) => {
  // Handle profile image update during login if provided
  const loginData = req.body;

  const data: any = await AuthServices.loginUser(loginData);

  const tokens = await generateAuthTokens(data._id.toString());

  if (loginData?.device === 'web') {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:
        Number(config.tokens.accessTokenExpires || 7) * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:
        Number(config.tokens.refreshTokenExpires || 30) * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Sign in successfully',
    data: data,
    tokens: tokens,
  });
});

// login admin Dashboard
const LoginAdmin: RequestHandler = catchAsync(async (req, res, next) => {
  const loginData = req.body;

  const data: any = await AuthServices.loginUser(loginData);

  if (data.role !== 'admin' && data.role !== 'superAdmin')
    throw new AppError(httpStatus.UNAUTHORIZED, 'wrong credentials');

  const tokens = await generateAuthTokens(data._id.toString());

  res.cookie('access_token', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: Number(config.tokens.accessTokenExpires || 7) * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie('refresh_token', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:
      Number(config.tokens.refreshTokenExpires || 30) * 24 * 60 * 60 * 1000, // 30 days
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin Sign in successfully',
    data: data,
    tokens: tokens,
  });
});

// Verify OTP
const VerifyOtp: RequestHandler = catchAsync(async (req, res, next) => {
  const { email, oneTimeCode } = req.body;

  const user = await AuthServices.verifyOtp(email, oneTimeCode);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'oneTimeCode verified successfully',
    data: {},
  });
});

// Forgot Password
const ForgotPassword: RequestHandler = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const result = await AuthServices.forgotPassword(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP sent to email',
    data:
      config.node === 'production'
        ? undefined
        : { oneTimeCode: result?.oneTimeCode || null },
  });
});

// reset password
const ResetPassword: RequestHandler = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const result = await AuthServices.resetPassword(email, password);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successfully',
    data: {},
  });
});

// update password
const UpdatePassword: RequestHandler = catchAsync(async (req, res, next) => {
  const { user }: any = req;
  const { oldPassword, newPassword } = req.body;

  const result = await AuthServices.updatePassword(
    user.email,
    oldPassword,
    newPassword,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully',
    data: config.node === 'production' ? undefined : result,
  });
});

// Logout User
const LogoutUser: RequestHandler = catchAsync(async (req, res, next) => {
  let token: string | undefined;
  const { refresh_token } = req.cookies;

  if (refresh_token) token = refresh_token;
  if (!token) token = req.body.refresh_token;
  if (!token) throw new AppError(httpStatus.BAD_REQUEST, 'Token is required');

  await invalidateUserAuthToken(token);

  res.clearCookie('access_token');
  res.clearCookie('refresh_token');

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged out successfully',
    data: null,
  });
});

// Refresh User Token
const RefreshUserToken: RequestHandler = catchAsync(async (req, res, next) => {
  let token: string | undefined;
  const { refresh_token } = req.cookies;

  if (refresh_token) token = refresh_token;
  if (!token) token = req.body.refresh_token;
  if (!token) throw new AppError(httpStatus.BAD_REQUEST, 'Token is required');

  const tokens = await refreshUserAuthToken(token);

  if (req.body?.type === 'web') {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:
        Number(config.tokens.accessTokenExpires || 7) * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:
        Number(config.tokens.refreshTokenExpires || 30) * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User token refreshed successfully',
    data: null,
    tokens: tokens,
  });
});

const LoginWithOAuth: RequestHandler = catchAsync(async (req, res, next) => {
  const { token, provider, name, email, image } = req.body;

  if (!token || !provider)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Token and provider are required',
    );

  let result: any;

  switch (provider) {
    case 'google':
      result = await AuthServices.googleLogin(token, name, email, image);
      break;
    // Add more cases for other providers if needed
    default:
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid provider');
  }

  if (!result) throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');

  const tokens = await generateAuthTokens(result._id.toString());

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    data: result,
    tokens: tokens,
  });
});

export const AuthController = {
  createUser,
  LoginUser,
  LoginAdmin,
  LogoutUser,
  LoginWithOAuth,
  UpdatePassword,
  ResetPassword,
  ForgotPassword,
  VerifyOtp,
  RefreshUserToken,
};
