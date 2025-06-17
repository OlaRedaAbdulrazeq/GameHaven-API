import express from 'express';
import {
  getGames,
  getGameByIdController,
  addGame,
  updateGame,
  deleteGame,
} from '../controllers/gameController.js';

import {
  verifyToken,
  isAdmin,
  verifyTokenOptional,
} from '../middleware/authMiddleware.js';
import {
  gameCreateValidationRules,
  gameUpdateValidationRules,
  validateGameFields,
} from '../validators/gameValidators.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public
router.get('/', verifyTokenOptional, getGames);
router.get('/:id', verifyTokenOptional, getGameByIdController);

// Admin
router.post(
  '/',
  isAdmin,
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'gallery', maxCount: 5 },
  ]),
  validateGameFields,
  gameCreateValidationRules,
  addGame
);
router.put(
  '/:id',
  verifyToken,
  isAdmin,
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'gallery', maxCount: 5 },
  ]),
  gameUpdateValidationRules,
  validateGameFields,
  updateGame
);
router.delete('/:id', verifyToken, isAdmin, deleteGame);

export default router;
