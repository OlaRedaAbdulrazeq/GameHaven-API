import Game from '../models/gameModel.js';
import ApiError from '../utils/ApiError.js';
import { uploadToImgbb } from '../utils/imgbbUpload.js';

export const getAllGames = async (
  { page = 1, limit = 10, genre, platform, category, keyword },
  user
) => {
  const filters = {};

  if (genre) filters.genre = genre;
  if (platform) filters.platform = platform;
  if (category) filters.categories = category;
  if (keyword) filters.title = { $regex: keyword, $options: 'i' };

  // Filter out unavailable games unless admin
  if (!user || user.role !== 'admin') {
    filters.stock = { $gt: 0 };
  }
  const skip = (page - 1) * limit;

  // Only select specific fields here
  const games = await Game.find(filters)
    .select('title platform genre price cover stock description categories')
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
export const addNewGame = async (gameData, fileBuffer) => {
  try {
    if (fileBuffer) {
      const imageUrl = await uploadToImgbb(fileBuffer);
      gameData.cover = imageUrl;
    }
    const game = new Game(gameData);
    return await game.save();
  } catch (err) {
    throw new ApiError(400, 'Invalid game data', true, err.stack);
  }
};
export const updateGameById = async (id, updateData, fileBuffer) => {
  if (fileBuffer) {
    const imageUrl = await uploadToImgbb(fileBuffer);
    updateData.cover = imageUrl;
  }
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
