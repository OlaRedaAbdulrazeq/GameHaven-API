import Game from '../models/gameModel.js';
import ApiError from '../utils/ApiError.js';

export const getAllGames = async (
  { page = 1, limit = 10, genre, platform, keyword },
  user
) => {
  const filters = {};

  if (genre) filters.genre = genre;
  if (platform) filters.platform = platform;
  if (keyword) filters.title = { $regex: keyword, $options: 'i' };
  // Filter out unavailable games unless admin
  if (!user || user.role !== 'admin') {
    filters.stock = { $gt: 0 };
  }
  const skip = (page - 1) * limit;

  // Only select specific fields here
  const games = await Game.find(filters)
    .select('title platform genre price')
    .skip(skip)
    .limit(Number(limit));

  const total = await Game.countDocuments(filters);

  return { games, total, page: +page, pages: Math.ceil(total / limit) };
};

export const getGameById = async (id) => {
  const game = await Game.findById(id);
  if (!game) throw new ApiError(404, 'Game not found');
  return game;
};

export const addNewGame = async (gameData) => {
  try {
    const game = new Game(gameData);
    return await game.save();
  } catch (err) {
    throw new ApiError(400, 'Invalid game data', true, err.stack);
  }
};

export const updateGameById = async (id, updateData) => {
  const game = await Game.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!game) throw new ApiError(404, 'Game not found');
  return game;
};

export const deleteGameById = async (id) => {
  const game = await Game.findByIdAndDelete(id);
  if (!game) throw new ApiError(404, 'Game not found');
  return game;
};
