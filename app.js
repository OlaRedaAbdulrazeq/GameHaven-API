import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import connectDB from './config/db.js';
import mainRouter from './routes/index.js';
import errorHandler from './middleware/errorMiddleware.js';
import ApiError from './utils/ApiError.js';
import process from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', mainRouter);

app.all(/(.*)/, (req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

app.use(errorHandler);

export default app;
