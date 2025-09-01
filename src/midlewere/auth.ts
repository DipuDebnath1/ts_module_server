/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextFunction, Request, Response } from 'express';
// import catchAsync from '../app/utills/catchAsync';
// import AppError from '../app/ErrorHandler/AppError';
// import httpStatus from 'http-status';
// import { tokenDecoded } from '../app/utills/tokenDecoded';

// // verifyUser;
// export const verifyUser = () => {
//   return catchAsync(
//     async (req: Request, res: Response, next: NextFunction): Promise<any> => {
//       const authHeader = req.headers.authorization;

//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res
//           .status(httpStatus.UNAUTHORIZED)
//           .json({ message: 'Authorization token missing or incorrect format' });
//       }

//       const decoded = tokenDecoded(authHeader);

//       if (!decoded) {
//         new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized, missing token');
//       }
//       if (decoded?.data.role === 'user' || decoded?.data.role === 'admin') {
//         next();
//       } else {
//         res.status(httpStatus.UNAUTHORIZED).json({
//           statusCode: httpStatus.UNAUTHORIZED,
//           success: false,
//           message: 'You have no access to this route',
//         });
//       }
//     },
//   );
// };

// // verifyAdmin;
// export const verifyAdmin = () => {
//   return catchAsync(
//     async (req: Request, res: Response, next: NextFunction): Promise<any> => {
//       const authHeader = req.headers.authorization;

//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res
//           .status(httpStatus.UNAUTHORIZED)
//           .json({ message: 'Authorization token missing or incorrect format' });
//       }

//       const decoded = tokenDecoded(authHeader);
//       if (!decoded) {
//         new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized, missing token');
//       }
//       if (decoded?.data.role === 'admin') {
//         next();
//       } else {
//         res.status(httpStatus.UNAUTHORIZED).json({
//           statusCode: httpStatus.UNAUTHORIZED,
//           success: false,
//           message: 'You have no access to this route',
//         });
//       }
//     },
//   );
// };
// // verifyLoginUser;
// export const verifyLoginUser = () => {
//   return catchAsync(
//     async (req: Request, res: Response, next: NextFunction): Promise<any> => {
//       const authHeader = req.headers.authorization;

//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res
//           .status(httpStatus.UNAUTHORIZED)
//           .json({ message: 'Authorization token missing or incorrect format' });
//       }

//       const decoded = tokenDecoded(authHeader);
//       if (!decoded) {
//         new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized, missing token');
//       }
//       if (decoded?.data.role === 'admin' || decoded?.data.role === 'user') {
//         next();
//       } else {
//         res.status(httpStatus.UNAUTHORIZED).json({
//           statusCode: httpStatus.UNAUTHORIZED,
//           success: false,
//           message: 'You have no access to this route',
//         });
//       }
//     },
//   );
// };

import httpStatus from 'http-status';
import { tokenDecoded } from '../app/utills/tokenDecoded';
import AppError from '../app/ErrorHandler/AppError';
import { User } from '../app/modules/user/user.model';

// Authorization middleware
const auth =
  (...requiredRights: string[]) =>
  async (req: any, res: any, next: any) => {
    try {
      let token: string | undefined;

      // First, try to get the token from the Authorization header
      const authorization = req.headers.authorization;
      if (authorization && authorization.startsWith('Bearer ')) {
        token = authorization.split(' ')[1];
      }

      // If no token in the Authorization header, check cookies
      if (!token) {
        token = req.cookies.access;
      }

      if (!token) {
        return next(
          new AppError(httpStatus.UNAUTHORIZED, 'Authorization token missing!'),
        );
      }

      // Step 1: Verify token
      const decodedData: any = tokenDecoded(token);
      const userId = decodedData.sub; // User ID is typically in the "sub" field of JWT

      // Step 2: Find user from database using the userId (Assuming you have a UserModel)
      const user = await User.findById(userId);
      if (!user) {
        return next(new AppError(httpStatus.UNAUTHORIZED, 'User not found'));
      }

      // Step 3: Check if the user is deleted
      if (user.isDeleted) {
        return next(
          new AppError(httpStatus.UNAUTHORIZED, 'User account is deleted'),
        );
      }

      // Step 4: Get the user's roles from the `roles.ts` file
      const userRoles = roleRights.get(user.role);
      if (!userRoles) {
        return next(
          new AppError(httpStatus.FORBIDDEN, 'User role does not exist'),
        );
      }

      // Step 5: Check if the user has required rights
      if (requiredRights.length) {
        const hasRequiredRights = requiredRights.every((requiredRight) =>
          userRoles.includes(requiredRight),
        );
        if (!hasRequiredRights && req.params.userId !== user.id) {
          return next(new AppError(httpStatus.FORBIDDEN, 'Forbidden'));
        }
      }

      // Attach the user to the request object
      req.user = user;

      // Continue to the next middleware
      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
