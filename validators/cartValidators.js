import { body } from 'express-validator';

export const addToCartValidator = [
  body('gameId').isMongoId().withMessage('Invalid game ID format'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];
