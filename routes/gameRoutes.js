import express from 'express';
import {
  getGames,
  getGameByIdController,
  addGame,
  updateGame,
  deleteGame,
} from '../controllers/gameController.js';

import {
  protect,
  isAdmin,
  verifyTokenOptional,
} from '../middleware/authMiddleware.js';
import {
  gameCreateValidationRules,
  gameUpdateValidationRules,
  validate,
  validateGameFields,
} from '../validators/gameValidators.js';
import upload from '../middleware/uploadMiddleware.js';

import {
  createReview,
  getReviewsForGame,
} from '../controllers/reviewController.js';

const router = express.Router();

// Public
router.get('/', verifyTokenOptional, getGames);
router.get('/:id', verifyTokenOptional, getGameByIdController);

// Admin
router.post(
  '/',
  protect,
  isAdmin,
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'gallery', maxCount: 5 },
  ]),
  validateGameFields,
  gameCreateValidationRules,
  validate,
  addGame
);
router.put(
  '/:id',
  protect,
  isAdmin,
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'gallery', maxCount: 5 },
  ]),
  gameUpdateValidationRules,
  validateGameFields,
  validate,
  updateGame
);
router.delete('/:id', protect, isAdmin, deleteGame);

router.get('/:gameId/reviews', getReviewsForGame);
router.post('/:gameId/reviews', protect, createReview);

export default router;
