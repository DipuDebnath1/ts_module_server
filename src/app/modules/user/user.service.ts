/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import { TUser } from './user.interface';
import { User } from './user.model';
import { sendOtpVerificationMail } from '../../../config/mailService/sendOtp';
import generateOtp from '../../utils/genarateOtp';

// **********USER SERVICES**********
// create User
const createUser = async (payload: TUser) => {
  return await User.create(payload);
};

// Find Single User
const getUserById = async (id: string) => {
  return await User.findById(id);
};

const getUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

// Update User
const isUpdateUser = async (userId: string, updateBody: Partial<TUser>) => {
  const user = await getUserById(userId);
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
  // Remove sensitive fields that shouldn't be updated directly
  const { password, role, isDeleted, ...safeUpdateData } = updateData;

  // Handle password update separately if provided

  const updatedUser = await User.findByIdAndUpdate(userId, safeUpdateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return updatedUser;
};

export const UserServices = {
  createUser,
  getUserByEmail,
  isUpdateUser,
  getUserById,
  updateUserProfile,
};
