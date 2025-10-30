/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import { TUser } from './user.interface';
import { User } from './user.model';
import { sendOtpVerificationMail } from '../../../config/mailService/sendOtp';
import generateOtp from '../../utils/genarateOtp';
import BaseService from '../../../service/DBService';

// const UserService = new BaseService<TUser>(User);

const UserService = new BaseService<TUser>(User);
// **********USER SERVICES**********

// Update User
const isUpdateUser = async (userId: string, updateBody: Partial<TUser>) => {
  const user = await UserService.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const code = generateOtp();

  // Send OTP email
  sendOtpVerificationMail(user?.email, code);

  Object.assign(user, updateBody, {
    isDeleted: false,
    isSuspended: false,
    isEmailVerified: false,
    isResetPassword: false,
    isPhoneNumberVerified: false,
    oneTimeCode: code,
  });
  await user.save();
  return user;
};

// Update User Profile
const updateUserProfile = async (
  userId: string,
  updateData: Partial<TUser>,
) => {
  const { password, role, isDeleted, ...safeUpdateData } = updateData;

  const updatedUser = await UserService.updateById(userId, safeUpdateData);

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return updatedUser;
};

export const UserServices = {
  isUpdateUser,
  updateUserProfile,
};
