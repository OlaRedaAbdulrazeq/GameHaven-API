import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import User from '../models/userModel.js';
import process from 'node:process';

export const verifyToken = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'Not authorized, token missing'));
    }

    // Verify token using the same JWT_SECRET from your authService
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user object to request
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized, user not found'));
    }

    next();
  } catch (error) {
    return next(new ApiError(401, 'Not authorized, token invalid'));
  }
};

export const verifyTokenOptional = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch (err) {
    // Invalid token – continue without setting req.user
  }

  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return next(new ApiError(403, 'Access denied, admin only'));
};
