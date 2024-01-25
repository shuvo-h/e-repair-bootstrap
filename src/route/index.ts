import { productRouter } from './../module/product/product.route';
import express from 'express';
import { authRouter } from '../module/auth/auth.route';
import { salesOrderRouter } from '../module/salesOrder/salesorder.route';

export const PrimaryRouter = express.Router();

const moduleRoutes = [
  { path: '/auth', route: authRouter },
  { path: '/products', route: productRouter },
  { path: '/sale-orders', route: salesOrderRouter },
];

moduleRoutes.forEach((routerEl) =>
  PrimaryRouter.use(routerEl.path, routerEl.route),
);
