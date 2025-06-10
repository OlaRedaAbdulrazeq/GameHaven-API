import { body } from 'express-validator';

export const registerValidator = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  //FIX: This should be handled as the user cannot define their role, but we are simplifying things for testing and development.
  body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
];

export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];
