import { Document } from 'mongoose';

export type TRoles = ['user', 'admin', 'superAdmin'];

export interface TUser extends Document {
  name: string;
  email: string;
  isEmailVerified?: boolean;
  phone?: string;
  isPhoneVerified?: boolean;
  password?: string;
  image?: string;
  role?: 'user' | 'admin' | 'superAdmin';
  isPasswordMatch(password: string): Promise<boolean>;
  oneTimeCode?: number | null;
  isDeleted?: boolean;
  isResetPassword?: boolean;
}
