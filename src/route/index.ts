import express from 'express';
import { authRouter } from '../module/auth/auth.route';

export const PrimaryRouter = express.Router();

const moduleRoutes = [
    { path: '/auth', route: authRouter },
]

moduleRoutes.forEach((routerEl) =>
  PrimaryRouter.use(routerEl.path, routerEl.route),
);
