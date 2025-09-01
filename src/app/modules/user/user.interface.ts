export type TUser = {
  name: string;
  email: string;
  isEmailVerified: boolean;
  phone: string;
  isPhoneVerified: boolean;
  password: string;
  img?: string;
  role: 'user' | 'admin';
  isDeleted: boolean;
};
