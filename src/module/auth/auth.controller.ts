import httpStatus from 'http-status';
import { env } from '../../config/config';
import { ExpressMiddleware } from '../../interface';
import { catchAsync } from '../../utils/catchAsync';
import { sendRes } from '../../utils/sendRes';
import { AuthServices } from './auth.service';

const createUser: ExpressMiddleware = async (req, res) => {
  const {isCookieRest,...restBody} = req.body;
  const { accessToken, refreshToken, user } = await AuthServices.createUser(
    restBody,
  );

  // do login to this new user
    if (isCookieRest) {
      res.cookie('refreshToken', refreshToken, {
        secure: env.isProduction,
        httpOnly: true,
      });
      res.cookie('accessToken', accessToken, {
        secure: env.isProduction,
        httpOnly: true,
      });
    }
  sendRes(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Created and login successful',
    data: { accessToken, user },
  });
};
const loginUser: ExpressMiddleware = async (req, res) => {
  const { accessToken, refreshToken, user } = await AuthServices.loginUser(
    req.body,
  );

  // do login to this new user

  res.cookie('refreshToken', refreshToken, {
    secure: env.isProduction,
    httpOnly: true,
  });
  res.cookie('accessToken', accessToken, {
    secure: env.isProduction,
    httpOnly: true,
  });
  sendRes(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User login successful',
    data: { accessToken, user },
  });
};

export const AuthControllers = {
  createUser: catchAsync(createUser),
  loginUser: catchAsync(loginUser),
};
