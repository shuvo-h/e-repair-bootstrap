import express from 'express';
import { AuthControllers } from './auth.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { authValidations } from './auth.validation';

export const authRouter = express.Router();

authRouter.post(
  '/register',
  // authCheck(USER_ROLE.USER),
  validateRequest(authValidations.userRegistrationValidationSchema),
  AuthControllers.createUser,
);
