import asyncHandler from '../utils/asyncHandler.js';
import { validationResult } from 'express-validator';
import * as authService from '../services/authService.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

export const register = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(
      400,
      errors
        .array()
        .map((e) => e.msg)
        .join(', ')
    );
  }
  const { user, token } = await authService.registerUser(req.body);
  res
    .status(201)
    .json(
      new ApiResponse(201, { ...user, token }, 'User registered successfully')
    );
});

export const login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(
      400,
      errors
        .array()
        .map((e) => e.msg)
        .join(', ')
    );
  }
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser(email, password);
  res
    .status(200)
    .json(new ApiResponse(200, { ...user, token }, 'Login successful'));
});
