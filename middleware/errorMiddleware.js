import ApiError from '../utils/ApiError.js';
import process from 'node:process';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ApiError(404, message);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered for ${field}`;
    error = new ApiError(400, message);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new ApiError(400, messages.join(', '));
  }

  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token. Please log in again.');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired. Please log in again.');
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
};

export default errorHandler;
