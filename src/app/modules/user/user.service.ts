/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import httpStatus from 'http-status';
import AppError from '../../ErrorHandler/AppError';
import { TUser } from './user.interface';
import { User } from './user.model';
import bcrypt from 'bcrypt';

// ********user*********

// sign up User
const createUserIntoDB = async (payload: TUser) => {
  try {
    const result = await User.create(payload);
    return result;
  } catch (err: any) {
    console.log('Error user signup failed', err);
    throw new AppError(
      httpStatus.CONFLICT,
      err.message || 'user account create failed',
    );
  }
};
// login user
const loginUser = async (payload: Partial<TUser>) => {
  const { password, email } = payload;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'user not found');
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password as string, user.password);

    if (isMatch) {
      // check user.isDeleted
      if (user.isDeleted) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'sorry you already deleted!',
        );
      }

      // check user.isBlocked

      if (user.isBlocked) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'sorry you already blocked!',
        );
      }

      // all ok sent user
      return user;
    } else {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Password does not match');
    }
  } catch (err) {
    console.log('Error comparing passwords:', err);
    throw err;
  }
};

// find single user
const findSingleUser = async (id: string) => {
  try {
    const data = await User.findById(id)
      // .populate('totalFollower', 'name email img')
      // .populate('totalFollowing', 'name email img');
      .populate('totalFollower')
      .populate('totalFollowing');

    return data;
  } catch (err) {
    console.log('Error comparing passwords:', err);
    throw err;
  }
};
// updateUserProfileDB;
const updateUserProfileDB = async (userId: string, payload: Partial<TUser>) => {
  try {
    // console.log(userId, payload);
    const result = User.findByIdAndUpdate(userId, payload, { new: true });
    return result;
  } catch (err: any) {
    throw new AppError(
      httpStatus.CONFLICT,
      err.message || 'user account update failed',
    );
  }
};

// follow user
const followingUser = async (userId: string, followedId: string) => {
  try {
    const user = await User.findById(userId);
    const followedUser = await User.findById(followedId);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (!followedUser) {
      throw new AppError(httpStatus.NOT_FOUND, 'Followed user not found');
    }

    // Check if the user
    const isFollowing = user.totalFollowing.includes(followedId as any);
    const isFollowed = followedUser.totalFollower.includes(userId as any);

    if (!isFollowing || !isFollowed) {
      // add IDs to the arrays
      const res = await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: { totalFollowing: followedId },
        },
        { new: true },
      );
      await User.findByIdAndUpdate(followedId, {
        $addToSet: { totalFollower: userId },
      });
      return res;
    }
  } catch (err: any) {
    throw new AppError(
      httpStatus.CONFLICT,
      err.message || 'Following failed !!',
    );
  }
};

// un follow user
const unFollowingUser = async (userId: string, followedId: string) => {
  try {
    // Remove userId from the followed user's followers list
    const followedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { totalFollowing: followedId } },
      { new: true },
    );

    if (!followedUser) {
      throw new AppError(httpStatus.NOT_FOUND, 'Followed user not found');
    }

    // Remove followedId from the user's following list
    const user = await User.findByIdAndUpdate(
      followedId,
      { $pull: { totalFollower: userId } },
      { new: true },
    );

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    return user;
  } catch (err: any) {
    throw new AppError(
      httpStatus.CONFLICT,
      err.message || 'Following failed !!',
    );
  }
};

// ********admin******

// change user role
const changeUserRoleDB = async (
  userId: string,
  role: string,
  adminId: string,
) => {
  if (userId === adminId) {
    throw new AppError(httpStatus.BAD_REQUEST, "you can't change your role !");
  }
  try {
    if (role !== 'admin' && role !== 'user') {
      throw new AppError(httpStatus.BAD_REQUEST, 'enter valid user role !');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, "user Can't found !");
    }
    if (user.role === role) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `user already have role : ${role}`,
      );
    }

    if (user.role !== role) {
      user.role = role;
      await user.save();
      return user;
    }
  } catch (error: any) {
    throw new AppError(
      httpStatus.CONFLICT,
      error.message || 'user blocked failed',
    );
  }
};
// blocked user
const blockedUserDB = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, "user Can't found !");
    }
    if (user.isBlocked) {
      throw new AppError(httpStatus.BAD_REQUEST, 'user already have blocked');
    }
    user.isBlocked = true;
    await user.save();

    return user;
  } catch (error: any) {
    throw new AppError(
      httpStatus.CONFLICT,
      error.message || 'user blocked failed',
    );
  }
};
//un blocked user
const unBlockedUserDB = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, "user Can't found !");
    }
    if (!user?.isBlocked) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'user already have been Unblocked',
      );
    }
    user.isBlocked = false;
    await user.save();

    return user;
  } catch (error: any) {
    throw new AppError(
      httpStatus.CONFLICT,
      error.message || 'user blocked failed',
    );
  }
};

// delete user
const deleteUserDB = async (userId: string, adminId: string) => {
  try {
    if (userId === adminId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'you can not deleted you');
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, "user Can't found !");
    }
    if (user.isDeleted) {
      throw new AppError(httpStatus.BAD_REQUEST, 'user already have deleted');
    }

    user.isDeleted = true;
    await user.save();

    return user;
  } catch (error: any) {
    throw new AppError(
      httpStatus.CONFLICT,
      error.message || 'user delete failed',
    );
  }
};

// restore user
const restoreUserDB = async (userId: string, adminId: string) => {
  try {
    if (userId === adminId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'you can not restore you');
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, "user Can't found !");
    }
    if (!user.isDeleted) {
      throw new AppError(httpStatus.BAD_REQUEST, 'user not found delete list');
    }

    user.isDeleted = false;
    await user.save();

    return user;
  } catch (error: any) {
    throw new AppError(
      httpStatus.CONFLICT,
      error.message || 'user restore failed',
    );
  }
};

// get all user
const findAllUsersFromDB = async () => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
    if (!users.length) {
      throw new AppError(httpStatus.NOT_FOUND, 'No users found');
    }

    return users;
  } catch (error: any) {
    new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to fetch users',
    );
  }
};

export const UserServices = {
  createUserIntoDB,
  loginUser,
  findSingleUser,
  updateUserProfileDB,
  changeUserRoleDB,
  blockedUserDB,
  unBlockedUserDB,
  deleteUserDB,
  restoreUserDB,
  followingUser,
  unFollowingUser,
  findAllUsersFromDB,
};
