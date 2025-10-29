/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';
// import bcrypt from 'bcryptjs';
import bcrypt from 'bcrypt';
import { TUser } from './user.interface';

// Simple User Schema
const userSchema = new Schema<TUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
      required: false,
    },
    password: {
      type: String,
      required: false,
      private: true,
    },
    image: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superAdmin'],
      default: 'user',
      required: false,
    },

    oneTimeCode: {
      type: String,
      default: null,
      required: false,
    },
    isResetPassword: {
      type: Boolean,
      default: false,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.statics.isPhoneNumberTaken = async function (
  phoneNumber,
  excludeUserId,
) {
  const user = await this.findOne({ phoneNumber, _id: { $ne: excludeUserId } });
  return !!user;
};

// Instance method to check password match
userSchema.methods.isPasswordMatch = async function (password: string) {
  const user = this;
  const res = await bcrypt.compare(password, user.password);
  return res;
};

// Pre-save hook to hash the password
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password!, 8);
  }
  next();
});

userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete (ret as Partial<TUser>).password; // ✅ no TS error
    return ret;
  },
});

export const User = model<TUser>('User', userSchema);
