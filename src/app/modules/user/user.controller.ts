/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';
import { User } from './user.model';
import { TUser } from './user.interface';
import BaseService from '../../../service/DBService';
import { ImageUrl } from '../../utils/urlAddInUploadedImage';

// *************USER CONTROLLERS*********

const UserService = new BaseService<TUser>(User);

// Find Single User
const FindSingleUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User ID is required');
    }

    const data = await UserService.findById(id);

    if (!data) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User retrieved successfully',
      data: data,
    });
  },
);

// Update User Profile
const UpdateUserProfile: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { user }: any = req;
    const { _id } = user;

    // Handle file upload if present
    if (req.file) req.body.image = ImageUrl(req.file);

    const data = await UserServices.updateUserProfile(_id, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Profile updated successfully',
      data: data,
    });
  },
);

// get self profile
const GetSelfProfile: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { user }: any = req;
    const { _id } = user;

    const data = await UserService.findById(_id);

    if (!data) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User retrieved successfully',
      data: data,
    });
  },
);

export const UserController = {
  FindSingleUser,
  UpdateUserProfile,
  GetSelfProfile,
};
