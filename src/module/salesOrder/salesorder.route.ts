import express from 'express';
import { authCheck } from '../../middlewares/AuthCheck';
import { USER_ROLE } from '../user/user.constant';
import { validateRequest } from '../../middlewares/validateRequest';
import { salesOrderValidation } from './salesorder.validation';
import { SalesOrderControllers } from './salesorder.controller';

export const salesOrderRouter = express.Router();

salesOrderRouter.post(
  '/order',
  authCheck(USER_ROLE.USER,USER_ROLE.Manager),
  validateRequest(salesOrderValidation.salesOrderCreateValidationSchema),
  SalesOrderControllers.createSaleOrder,
);

salesOrderRouter.get(
  '/',
  authCheck(USER_ROLE.USER,USER_ROLE.Manager),
  SalesOrderControllers.getSalesQuantity,
);
