import express from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';
import { addToCartValidator } from '../validators/cartValidators.js';
import { param } from 'express-validator';

const router = express.Router();

router.use(protect); // All cart routes require login

router
  .route('/')
  .get(getCart)
  .post(addToCartValidator, addItemToCart)
  .delete(clearCart); // Clear entire cart

router
  .route('/:gameId')
  .put(
    param('gameId').isMongoId().withMessage('Invalid game ID format'),
    // Add quantity validation if needed for PUT
    updateCartItem
  )
  .delete(
    param('gameId').isMongoId().withMessage('Invalid game ID format'),
    removeItemFromCart
  );

export default router;
