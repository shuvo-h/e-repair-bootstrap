/* eslint-disable no-unused-vars */
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from './middlewares/globalErrHandler';
import { env } from './config/config';
import { notFound } from './middlewares/notFound';
import { PrimaryRouter } from './route';

export const app: Application = express();

// parsers
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [`${env.frontend_base_url}`, `${env.frontend_base_production_url}`], // only access by this port list
    credentials: true, // allow to set cookies in header
  }),
);

// application routes
app.use('/api/v1', PrimaryRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Electric Gadgets Management App');
});

// global error
app.use(globalErrorHandler);

// Not Found router
app.use(notFound);
