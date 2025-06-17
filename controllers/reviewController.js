import { createGameReview, getGameReviews } from '../services/reviewService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { gameId } = req.params;
  const userId = req.user._id;

  const review = await createGameReview(userId, gameId, rating, comment);

  const response = new ApiResponse(201, review, 'Review created successfully');
  res.status(response.statusCode).json(response);
});

export const getReviewsForGame = asyncHandler(async (req, res) => {
  const gameId = req.params.gameId;

  const reviews = await getGameReviews(gameId);

  const response = new ApiResponse(
    200,
    reviews,
    'Reviews fetched successfully'
  );
  res.status(response.statusCode).json(response);
});
