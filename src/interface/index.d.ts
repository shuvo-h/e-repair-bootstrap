/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// it is require to add a new property to express request for typescript
declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

export type ExpressMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;
