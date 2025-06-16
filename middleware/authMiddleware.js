import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/userModel.js';
import ApiError from '../utils/ApiError.js';
import process from 'node:process';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('JWT_SECRET in protect middleware:', process.env.JWT_SECRET); // DIAGNOSTIC LOG
      if (!process.env.JWT_SECRET) {
        throw new Error(
          'CRITICAL: JWT_SECRET is undefined in protect middleware!'
        );
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return next(new ApiError(401, 'Not authorized, user not found'));
      }
      next();
    } catch (error) {
      console.error(error);
      return next(new ApiError(401, 'Not authorized, token failed'));
    }
  }
  if (!token) {
    return next(new ApiError(401, 'Not authorized, no token'));
  }
});

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return next(new ApiError(403, 'Not authorized as an admin'));
  }
};
