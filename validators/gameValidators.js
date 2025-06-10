import { body } from 'express-validator';
import ApiError from '../utils/ApiError.js';
// Validation for creating a new game
export const gameCreateValidationRules = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),

  body('platform')
    .isArray({ min: 1 })
    .withMessage('Platform must be a non-empty array of strings')
    .custom((arr) => arr.every((p) => typeof p === 'string'))
    .withMessage('Each platform must be a string'),

  body('genre')
    .isArray({ min: 1 })
    .withMessage('Genre must be a non-empty array of strings')
    .custom((arr) => arr.every((g) => typeof g === 'string'))
    .withMessage('Each genre must be a string'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('ratings')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Ratings must be a non-negative number'),
];

// Validation for updating a game
export const gameUpdateValidationRules = [
  body('title').optional().isString().withMessage('Title must be a string'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),

  body('platform')
    .optional()
    .isArray()
    .withMessage('Platform must be an array of strings')
    .custom((arr) => arr.every((p) => typeof p === 'string'))
    .withMessage('Each platform must be a string'),

  body('genre')
    .optional()
    .isArray()
    .withMessage('Genre must be an array of strings')
    .custom((arr) => arr.every((g) => typeof g === 'string'))
    .withMessage('Each genre must be a string'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('ratings')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Ratings must be a non-negative number'),
];

const allowedGameFields = [
  'title',
  'description',
  'platform',
  'genre',
  'price',
  'cover',
  'gallery',
  'stock',
  'ratings',
];

export const validateGameFields = (req, res, next) => {
  const receivedFields = Object.keys(req.body);

  const invalidFields = receivedFields.filter(
    (field) => !allowedGameFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return next(
      new ApiError(400, `Invalid field(s): [${invalidFields.join(', ')}]`)
    );
  }

  next();
};
