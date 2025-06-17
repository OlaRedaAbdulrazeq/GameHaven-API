// services/reviewService.js

import Review from '../models/reviewModel.js';
import Game from '../models/gameModel.js';
import ApiError from '../utils/ApiError.js';

export const createGameReview = async (userId, gameId, rating, comment) => {
  const existing = await Review.findOne({ user: userId, game: gameId });
  if (existing) {
    throw new ApiError(400, 'You already reviewed this game');
  }

  const review = await Review.create({
    user: userId,
    game: gameId,
    rating,
    comment,
  });

  const allReviews = await Review.find({ game: gameId });

  const avgRating =
    allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

  await Game.findByIdAndUpdate(gameId, {
    ratings: avgRating,
    reviewCount: allReviews.length,
  });

  return review;
};

export const getGameReviews = async (gameId) => {
  const reviews = await Review.find({ game: gameId }).populate(
    'user',
    'username'
  );
  return reviews;
};
