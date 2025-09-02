/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

// *************USER CONTROLLERS*********

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
    updateData.image = req.file.filename;
  }

  const data = await UserServices.updateUserProfile(_id, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: data,
  });
});

// get self profile
const GetSelfProfile: RequestHandler = catchAsync(async (req, res, next) => {
  const { user }: any = req;
  const { _id } = user;

  const data = await UserServices.getUserById(_id);

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

export const UserController = {
  FindSingleUser,
  UpdateUserProfile,
  GetSelfProfile,
};
