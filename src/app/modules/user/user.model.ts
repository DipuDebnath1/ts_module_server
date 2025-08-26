// /* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from 'mongoose';
import { TUser } from './user.interface';
// import config from "../../config";
import bcrypt from 'bcrypt';
import config from '../../../config';

// password123 =  $2b$10$qx9jGbAFw4CUK4HoUn/MKehg2wYevxbQHWZ.MYsRulThLotnpbt.C
const userSchema = new Schema<TUser>(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
    },
    img: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
    },
    totalFollower: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: 'user',
    },
    totalFollowing: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: 'user',
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const userData = this;
  userData.password = await bcrypt.hash(
    userData.password,
    Number(config.saltRounds),
  );
  next();
});
//
// userSchema.pre('save', async function (next) {
//   // Only hash the password if it has been modified (i.e., not during every save operation)
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, Number(config.saltRounds));
//   }
//   next();
// });

userSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform: function (doc, ret, options) {
    ret.password = undefined;
    return ret;
  },
});

export const User = model<TUser>('user', userSchema);
