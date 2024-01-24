import express from 'express';

export const authRouter = express.Router();

authRouter.post(
  '/change-password',
  // authCheck(USER_ROLE.student, USER_ROLE.admin, USER_ROLE.faculty),
  // validateRequest(AuthValidation.changePasswordValidationSchema),
  // AuthControllers.changePassword,
);
