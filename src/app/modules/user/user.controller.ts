/* eslint-disable @typescript-eslint/no-unused-vars */
import { RequestHandler } from 'express';
import catchAsync from '../../utills/catchAsync';
import { UserServices } from './user.service';
import sendResponse from '../../utills/sendResponse';
import httpStatus from 'http-status';
import config from '../../../config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../../ErrorHandler/AppError';
import { tokenDecoded } from '../../utills/tokenDecoded';

// *************user*********
// createStudent;
const createStudent: RequestHandler = catchAsync(async (req, res, next) => {
  const result = await UserServices.createUserIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'User registered successfully',
    success: true,
    data: result,
  });
});

// LoginUser;
const LoginUser: RequestHandler = catchAsync(async (req, res, next) => {
  const data = await UserServices.loginUser(req.body);

  if (data) {
    const token = jwt.sign({ data }, config.accessTokenSecret as string, {
      expiresIn: '1y',
    });

    res.cookie('authToken', token, {
      httpOnly: true, // Accessible only by the web server
      secure: config.node === 'production', // Send only over HTTPS in production
      maxAge: 30 * 24 * 3600 * 1000,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User logged in successfully',
      data: data,
      token: token,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'User not found',
      data: [],
    });
  }
});

// Find Single User;
const FindSingleUser: RequestHandler = catchAsync(async (req, res, next) => {
  const data = await UserServices.findSingleUser(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved in successfully',
    data: data,
  });
});
// updateUserProfileDB;
const UpdateUserProfile: RequestHandler = catchAsync(async (req, res, next) => {
  const token = req?.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError(httpStatus.UNAUTHORIZED, 'No token provided'));
  }

  const decoded = jwt.verify(
    token,
    config.accessTokenSecret as string,
  ) as JwtPayload & { data: { _id: string } };
  const data = await UserServices.updateUserProfileDB(
    decoded.data._id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile Update in successfully',
    data: data,
  });
});
// followingUser;
const FollowingUser: RequestHandler = catchAsync(async (req, res, next) => {
  const token = req?.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError(httpStatus.UNAUTHORIZED, 'No token provided'));
  }

  const decoded = tokenDecoded(token);

  const data = await UserServices.followingUser(
    decoded.data._id,
    req.body.followedId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'follow successfully',
    data: data,
  });
});

// followingUser;
const UnFollowingUser: RequestHandler = catchAsync(async (req, res, next) => {
  const token = req?.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError(httpStatus.UNAUTHORIZED, 'No token provided'));
  }

  const decoded = tokenDecoded(token);

  const data = await UserServices.unFollowingUser(
    decoded.data._id,
    req.body.followedId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'un Follow successfully',
    data: data,
  });
});

//**********admin*********

// FindAllUser;
const FindAllUser: RequestHandler = catchAsync(async (req, res, next) => {
  const data = await UserServices.findAllUsersFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get all users successfully',
    data: data,
  });
});

// ChangeUserRole;
const ChangeUserRole: RequestHandler = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return next(new AppError(httpStatus.UNAUTHORIZED, 'No token provided'));
  }

  const decoded = tokenDecoded(token);

  const { userId, role } = req.body;
  const data = await UserServices.changeUserRoleDB(
    userId,
    role,
    decoded.data._id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User role update successfully',
    data: data,
  });
});
// BlockedUser;
const BlockedUser: RequestHandler = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const data = await UserServices.blockedUserDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User blocked successfully',
    data: data,
  });
});
// UnBlockedUser;
const UnBlockedUser: RequestHandler = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const data = await UserServices.unBlockedUserDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User unblocked successfully',
    data: data,
  });
});

// DeleteUserRole;
const DeleteUserRole: RequestHandler = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return next(new AppError(httpStatus.UNAUTHORIZED, 'No token provided'));
  }

  const decoded = tokenDecoded(token);

  const { userId } = req.body;
  const data = await UserServices.deleteUserDB(userId, decoded.data._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User delete successfully',
    data: data,
  });
});

// RestoreUserRole;
const RestoreUserRole: RequestHandler = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return next(new AppError(httpStatus.UNAUTHORIZED, 'No token provided'));
  }

  const decoded = tokenDecoded(token);

  const { userId } = req.body;
  const data = await UserServices.restoreUserDB(userId, decoded.data._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User restore successfully',
    data: data,
  });
});

export const UserController = {
  createStudent,
  LoginUser,
  FindSingleUser,
  UpdateUserProfile,
  FollowingUser,
  UnFollowingUser,
  ChangeUserRole,
  BlockedUser,
  UnBlockedUser,
  DeleteUserRole,
  RestoreUserRole,
  FindAllUser,
};
