export type TRoles = ['user', 'admin', 'superAdmin'];

export type TUser = {
  name: string;
  email: string;
  isEmailVerified: boolean;
  phone: string;
  isPhoneVerified: boolean;
  password: string;
  image?: string;
  role: 'user' | 'admin' | 'superAdmin';
  isPasswordMatch(password: string): Promise<boolean>;
  oneTimeCode: string | null;
  isDeleted: boolean;
  isResetPassword: boolean;
};
