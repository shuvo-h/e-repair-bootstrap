import { productRouter } from './../module/product/product.route';
import express from 'express';
import { authRouter } from '../module/auth/auth.route';

export const PrimaryRouter = express.Router();

const moduleRoutes = [
  { path: '/auth', route: authRouter },
  { path: '/products', route: productRouter },
];

moduleRoutes.forEach((routerEl) =>
  PrimaryRouter.use(routerEl.path, routerEl.route),
);
