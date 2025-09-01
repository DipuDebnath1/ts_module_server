/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import { TUser } from './user.interface';
import { User } from './user.model';
import bcrypt from 'bcrypt';
import config from '../../../config';

// **********USER SERVICES**********

// Create User in Database
const createUser = async (userData: TUser): Promise<TUser> => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser) {
    throw new AppError(
      httpStatus.CONFLICT,
      'User already exists with this email',
    );
  }

  return await User.create(userData);
};

// Login User
const loginUser = async (loginData: { email: string; password: string }) => {
  const { email, password } = loginData;

  // Find user by email
  const user = await getUserByEmail(email);

  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found !');
  if (!user.isDeleted)
    throw new AppError(httpStatus.BAD_REQUEST, 'User account is deleted !');
  if (!user.isEmailVerified)
    throw new AppError(httpStatus.UNAUTHORIZED, 'Email is not verified !');
  if (!user.isPasswordMatch(password))
    throw new AppError(httpStatus.UNAUTHORIZED, 'Password is incorrect !');

  return userResponse;
};

// Find Single User
const getUserById = async (id: string) => {
  const user = await User.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate('totalFollower', 'name email img')
    .populate('totalFollowing', 'name email img');

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

const getUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

const isUpdateUser = async (userId: string, updateBody: Partial<TUser>) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const oneTimeCode =
    Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

  if (updateBody.role === 'user' || updateBody.role === 'admin') {
    sendEmailVerification(updateBody.email, oneTimeCode);
  }

  Object.assign(user, updateBody, {
    isDeleted: false,
    isSuspended: false,
    isEmailVerified: false,
    isResetPassword: false,
    isPhoneNumberVerified: false,
    oneTimeCode: oneTimeCode,
  });
  await user.save();
  return user;
};

// Update User Profile
const updateUserProfileDB = async (
  userId: string,
  updateData: Partial<TUser>,
) => {
  // Remove sensitive fields that shouldn't be updated directly
  const { password, role, isDeleted, ...safeUpdateData } = updateData;

  // Handle password update separately if provided

  const updatedUser = await User.findByIdAndUpdate(userId, safeUpdateData, {
    new: true,
    runValidators: true,
  })
    .populate('totalFollower', 'name email img')
    .populate('totalFollowing', 'name email img');

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return updatedUser;
};

// **********ADMIN SERVICES**********

// Find All Users with Pagination and Search
const findAllUsersFromDB = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
) => {
  const skip = (page - 1) * limit;

  // Build search query
  const searchQuery: any = {};

  if (search) {
    searchQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  // Get total count for pagination
  const totalUsers = await User.countDocuments(searchQuery);

  // Get users with pagination
  const users = await User.find(searchQuery)
    .select('-password')
    .populate('totalFollower', 'name email img')
    .populate('totalFollowing', 'name email img')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    users,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      hasNextPage: page < Math.ceil(totalUsers / limit),
      hasPreviousPage: page > 1,
    },
  };
};

// Change User Role
const changeUserRoleDB = async (
  userId: string,
  newRole: string,
  adminId: string,
) => {
  // Check if target user exists
  const targetUser = await User.findOne({ _id: userId, isDeleted: false });

  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Prevent admin from changing their own role
  if (userId === adminId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot change your own role');
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { role: newRole },
    { new: true, runValidators: true },
  ).select('-password');

  return updatedUser;
};

// Soft Delete User
const deleteUserDB = async (userId: string, adminId: string) => {
  const user = await User.findOne({ _id: userId, isDeleted: false });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Prevent admin from deleting themselves
  if (userId === adminId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot delete your own account',
    );
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User is already deleted');
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true },
  ).select('-password');

  return updatedUser;
};

// Restore User
const restoreUserDB = async (userId: string, adminId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User is not deleted');
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isDeleted: false },
    { new: true },
  );

  return updatedUser;
};

// Get User Statistics (Bonus admin feature)
const getUserStatistics = async () => {
  const totalUsers = await User.countDocuments({ isDeleted: false });
  const activeUsers = await User.countDocuments({
    isDeleted: false,
    isBlocked: false,
  });
  const blockedUsers = await User.countDocuments({ isBlocked: true });
  const deletedUsers = await User.countDocuments({ isDeleted: true });
  const premiumUsers = await User.countDocuments({
    isPremium: true,
    isDeleted: false,
  });
  const adminUsers = await User.countDocuments({
    role: 'admin',
    isDeleted: false,
  });

  return {
    totalUsers,
    activeUsers,
    blockedUsers,
    deletedUsers,
    premiumUsers,
    adminUsers,
  };
};

export const UserServices = {
  // User services
  createUser,
  loginUser,
  getUserByEmail,
  isUpdateUser,
  getUserById,
  updateUserProfileDB,
  // Admin services
  findAllUsersFromDB,
  changeUserRoleDB,
  deleteUserDB,
  restoreUserDB,
  getUserStatistics,
};
