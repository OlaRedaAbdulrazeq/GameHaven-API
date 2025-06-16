import asyncHandler from '../utils/asyncHandler.js';
import { validationResult } from 'express-validator';
import * as cartService from '../services/cartService.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

export const getCart = asyncHandler(async (req, res, next) => {
  const cart = await cartService.getCart(req.user._id);
  res.status(200).json(new ApiResponse(200, cart));
});

export const addItemToCart = asyncHandler(async (req, res, next) => {
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
  const { gameId, quantity } = req.body;
  const cart = await cartService.addItemToCart(req.user._id, gameId, quantity);
  res.status(200).json(new ApiResponse(200, cart, 'Item added to cart'));
});

export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { gameId } = req.params;
  const { quantity } = req.body;
  if (!quantity || quantity < 0) {
    throw new ApiError(400, 'Quantity must be a positive number.');
  }
  const cart = await cartService.updateCartItemQuantity(
    req.user._id,
    gameId,
    quantity
  );
  res.status(200).json(new ApiResponse(200, cart, 'Cart item updated'));
});

export const removeItemFromCart = asyncHandler(async (req, res, next) => {
  const { gameId } = req.params;
  const cart = await cartService.removeItemFromCart(req.user._id, gameId);
  res.status(200).json(new ApiResponse(200, cart, 'Item removed from cart'));
});

export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await cartService.clearCart(req.user._id);
  res.status(200).json(new ApiResponse(200, cart, 'Cart cleared'));
});
