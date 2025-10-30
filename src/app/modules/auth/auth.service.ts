/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import { TUser, User } from '../user';
import generateOtp from '../../utils/genarateOtp';
import { sendOtpVerificationMail } from '../../../config/mailService/sendOtp';
import BaseService from '../../../service/DBService';
// import { OAuth2Client } from 'google-auth-library';
// import config from '../../../config';

const UserService = new BaseService<TUser>(User);

// Create User in Database
const signUpUser = async (userData: TUser) => {
  const code = generateOtp();
  userData.oneTimeCode = Number(code);
  const res = await UserService.create(userData);
  sendOtpVerificationMail(res.email, code);
  return res;
};

// Login User
const loginUser = async (loginData: { email: string; password: string }) => {
  const { email, password } = loginData;

  // Find user by email
  const user = await UserService.findOne({
    filters: { email },
    select: 'name email image role password isDeleted isEmailVerified',
  });

  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found !');

  if (user.isDeleted)
    throw new AppError(httpStatus.BAD_REQUEST, 'User account is deleted !');

  if (!user.isEmailVerified)
    throw new AppError(httpStatus.UNAUTHORIZED, 'Email is not verified !');

  const matchPassword = await user?.isPasswordMatch(password);
  if (!matchPassword)
    throw new AppError(httpStatus.UNAUTHORIZED, 'wrong credentials !');

  return user;
};

//forget password
const forgotPassword = async (email: string) => {
  const user = await UserService.findOne({
    filters: { email },
    select: 'email isResetPassword oneTimeCode',
  });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found !');

  const code = generateOtp();
  user.oneTimeCode = Number(code);
  user.isResetPassword = true;
  await user.save();

  sendOtpVerificationMail(user.email, code);
  return user;
};

// reset password
const resetPassword = async (email: string, newPassword: string) => {
  const user = await UserService.findOne({
    filters: { email },
    select: 'email isResetPassword password',
  });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found !');
  if (!user.isResetPassword)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'User is not in reset password state !',
    );
  user.password = newPassword;
  user.isResetPassword = false;
  await user.save();

  return user;
};

// change password
const updatePassword = async (
  email: string,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await UserService.findOne({
    filters: { email },
    select: 'email password',
  });

  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found !');

  const matchPassword = await user?.isPasswordMatch(oldPassword);
  if (!matchPassword)
    throw new AppError(httpStatus.UNAUTHORIZED, 'Old password is incorrect !');

  user.password = newPassword;
  await user.save();

  return user;
};

//  verify OTP
const verifyOtp = async (email: string, otp: string) => {
  const user = await UserService.findOne({
    filters: { email },
    select: 'email oneTimeCode isEmailVerified',
  });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found !');
  if (user.oneTimeCode !== Number(otp))
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid OTP !');
  user.isEmailVerified = true;
  user.oneTimeCode = null;
  await user.save();
  return user;
};

// google login
const googleLogin = async (
  token: string,
  name: string,
  email: string,
  image: string,
) => {
  // const googleClient = new OAuth2Client(config.googleClientId);
  // const ticket = await googleClient.verifyIdToken({
  //   idToken: token,
  //   audience: config.googleClientId,
  // });

  // const payload = ticket.getPayload();

  // if (!payload)
  //   throw new AppError(httpStatus.BAD_REQUEST, 'google login failed!');

  // const data: any = {
  //   name: payload.name!,
  //   email: payload.email!,
  //   image: payload.picture!,
  // };

  const data: any = {
    name: name,
    email: email,
    image: image || '',
  };

  let user;
  user = await UserService.findOne({
    filters: { email: data.email },
    select: 'name email image role',
  });
  if (!user) user = await UserService.create(data);

  return user;
};

export const AuthServices = {
  signUpUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyOtp,
  googleLogin,
};
