/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, RequestHandler } from 'express';
import catchAsync from '../../utills/catchAsync';
import { UserServices } from './user.service';
import sendResponse from '../../utills/sendResponse';
import httpStatus from 'http-status';
import config from '../../../config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../../ErrorHandler/AppError';
import { tokenDecoded } from '../../utills/tokenDecoded';
import { TUser } from './user.interface';

// *************USER CONTROLLERS*********

// Create User
const createUser: RequestHandler = catchAsync(async (req, res, next) => {
  // Handle file upload if present
  const userData = req.body;

  if (req.file) {
    userData.img = req.file.filename; // Store the uploaded file name
  }

  // const result = await UserServices.createUserIntoDB(userData);
  const { email } = req.body;
  const isUser = await UserServices.getUserByEmail(email);
  let code;

  if (isUser) {
    if (isUser.isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'User is deleted');
    } else if (!isUser.isEmailVerified) {
      await UserServices.isUpdateUser(isUser.id, { ...req.body });
    }
  } else {
    code = await UserServices.createUser(req.body);
  }

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'User registered successfully',
    success: true,
    data: {},
  });
});

// Login User
const LoginUser: RequestHandler = catchAsync(async (req, res, next) => {
  // Handle profile image update during login if provided
  const loginData = req.body;

  const data = await UserServices.loginUser(loginData);

  if (!data) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'Invalid credentials',
      data: null,
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { data },
    config.accessTokenSecret as string,
    { expiresIn: '7d' }, // Reduced from 1 year for security
  );

  // Set secure cookie
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: config.node === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    data: data,
    token: token,
  });
});

// Find Single User
const FindSingleUser: RequestHandler = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User ID is required');
  }

  const data = await UserServices.getUserById(id);

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: data,
  });
});

// Update User Profile
const UpdateUserProfile: RequestHandler = catchAsync(async (req, res, next) => {
  const { user }: any = req;
  const { _id } = user;
  const updateData = req.body;

  // Handle file upload if present
  if (req.file) {
    updateData.img = req.file.filename;
  }

  const data = await UserServices.updateUserProfileDB(_id, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: data,
  });
});

// **********ADMIN CONTROLLERS*********

// Find All Users
const FindAllUser: RequestHandler = catchAsync(async (req, res, next) => {
  // Add pagination support
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;

  const data = await UserServices.findAllUsersFromDB(page, limit, search);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: data,
  });
});

// Change User Role
const ChangeUserRole: RequestHandler = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'No token provided');
  }

  const decoded = tokenDecoded(token);
  const { userId, role } = req.body;

  if (!userId || !role) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User ID and role are required');
  }

  if (!['user', 'admin'].includes(role)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid role specified');
  }

  const data = await UserServices.changeUserRoleDB(
    userId,
    role,
    decoded.data._id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User role updated successfully',
    data: data,
  });
});

// Delete User (Soft Delete)
const DeleteUserRole: RequestHandler = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'No token provided');
  }

  const decoded = tokenDecoded(token);
  const { userId } = req.body;

  if (!userId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User ID is required');
  }

  if (decoded.data._id === userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot delete your own account',
    );
  }

  const data = await UserServices.deleteUserDB(userId, decoded.data._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: data,
  });
});

// Restore User
const RestoreUserRole: RequestHandler = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'No token provided');
  }

  const decoded = tokenDecoded(token);
  const { userId } = req.body;

  if (!userId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User ID is required');
  }

  const data = await UserServices.restoreUserDB(userId, decoded.data._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User restored successfully',
    data: data,
  });
});

// Logout User
const LogoutUser: RequestHandler = catchAsync(async (req, res, next) => {
  res.clearCookie('authToken');

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged out successfully',
    data: null,
  });
});

// Get Current User Profile
const GetCurrentUser: RequestHandler = catchAsync(
  async (req: Request, res, next) => {
    const { user }: any = req;
    const { _id } = user;

    const data = await UserServices.findSingleUser(_id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Current user profile retrieved successfully',
      data: data,
    });
  },
);

export const UserController = {
  // User operations
  createUser,
  LoginUser,
  LogoutUser,
  FindSingleUser,
  GetCurrentUser,
  UpdateUserProfile,

  // Admin operations
  FindAllUser,
  ChangeUserRole,
  DeleteUserRole,
  RestoreUserRole,
};
