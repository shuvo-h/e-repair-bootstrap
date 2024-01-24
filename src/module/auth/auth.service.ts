import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { USER_ROLE, USER_STATUS } from '../user/user.constant';
import { TUser } from '../user/user.interface';
import { UserModel } from '../user/user.model';
import { TLoginUser, TTokenUser } from './auth.interface';
import { env } from '../../config/config';
import { createJwtToken } from './auth.utils';

const createUser = async (payload: TUser) => {
  // chekc if email is not exist
  const existUser = await UserModel.exists({ email: payload.email });
  if (existUser) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, `email already exist`);
  }

  const newUser: Partial<TUser> = {};

  newUser.email = payload.email;
  newUser.password = payload.password;
  newUser.role = USER_ROLE.USER;
  newUser.status = USER_STATUS['in-progress'];
  newUser.isDeleted = false;

  const user = await UserModel.create(newUser);

  const tokenUser: TTokenUser = {
    _id: user._id,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  // access granted: accessToken, refreshToken

  const accessToken = createJwtToken(
    tokenUser,
    env.jwt_access_secret as string,
    env.jwt_access_token_expire_in as string,
  );
  const refreshToken = createJwtToken(
    tokenUser,
    env.jwt_refresh_secret as string,
    env.jwt_refresh_token_expire_in as string,
  );

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};

const loginUser = async (payload: TLoginUser) => {
  // check if user exist using static method
  // const user = await UserModel.isUserExistByCustomId(payload.id).select('+password');
  const user = await UserModel.findOne({ id: payload.id }).select('+password'); // tell with "+" sign to select password since in schema we have used {select:0}

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, `User doesn't exist`);
  }
  // check if user is not deleted
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, `User is already deleted`);
  }
  // check if user is not blocked
  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, `User is already blocked`);
  }

  // check if the password match
  const isPasswordMatched = await UserModel.isPasswordMatched(
    payload.password,
    user.password,
  );
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, `Invalid user id or password!`);
  }
  const tokenUser: TTokenUser = {
    _id: user._id,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  // access granted: accessToken, refreshToken

  const accessToken = createJwtToken(
    tokenUser,
    env.jwt_access_secret as string,
    env.jwt_access_token_expire_in as string,
  );
  const refreshToken = createJwtToken(
    tokenUser,
    env.jwt_refresh_secret as string,
    env.jwt_refresh_token_expire_in as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const AuthServices = {
  createUser,
  loginUser,
};
