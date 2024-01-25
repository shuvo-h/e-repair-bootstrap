/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import { TUserRole } from '../module/user/user.interface';
import { catchAsync } from '../utils/catchAsync';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/config';
import { UserModel } from '../module/user/user.model';
import { USER_STATUS } from '../module/user/user.constant';

export const authCheck = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not loggedin');
    }

    let decoded;

    // need try catch to catch error thrown from jwt
    try {
      decoded = jwt.verify(
        token,
        env.jwt_access_secret as string,
      ) as JwtPayload;
      if (!decoded) {
        throw new AppError(httpStatus.UNAUTHORIZED, `You are not authorized!`);
      }
    } catch (error: any) {
      throw new AppError(httpStatus.UNAUTHORIZED, `${error.message}`);
    }
    const { _id, role, iat } = decoded;

    const user = await UserModel.findById(_id).select('+password'); // tell with "+" sign to select password since in schema we have used password:{select:0}; the +sign return doc with other rest of the properties.
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, `User doesn't exist`);
    }

    // check if user is not deleted
    if (user.isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, `User is already deleted`);
    }

    // check if user is not deleted
    if (user.status === USER_STATUS.blocked) {
      throw new AppError(httpStatus.FORBIDDEN, `User is already blocked`);
    }

    // check if password is not changed after issued the token
    if (user.passwordChangedAt) {
      const isTokenIssuedBeforePasswordChanged =
        UserModel.isJwtIssuedBeforePasswordChanged(
          user.passwordChangedAt,
          iat as number,
        );
      if (isTokenIssuedBeforePasswordChanged) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `Invalid Token, Please login again!`,
        );
      }
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.FORBIDDEN, `You are not permitted`);
    }

    // if get typescript error to add user object with req, then go to "/interface/index.d.ts" file adn add the user property with Express Request namespace
    req.user = decoded as JwtPayload;
    next();
  });
};
