import { Types } from 'mongoose';

export type TUser = {
  name: string;
  email: string;
  password: string;
  phone: string;
  img: string;
  role: 'user' | 'admin';
  isPremium: boolean;
  isVerified: boolean;
  isBlocked: boolean;
  isDeleted: boolean;
  address: string;
  totalFollower: Types.ObjectId[] | string;
  totalFollowing: Types.ObjectId[] | string;
};
