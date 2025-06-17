import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

import {
  getAllGames,
  getGameById,
  addNewGame,
  updateGameById,
  deleteGameById,
} from '../services/gameService.js';
import Game from '../models/gameModel.js';

export const getGames = async (req, res, next) => {
  try {
    const result = await getAllGames(req.query, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getGameByIdController = async (req, res, next) => {
  try {
    const game = await getGameById(req.params.id);
    res.json(game);
  } catch (error) {
    next(error);
  }
};

export const addGame = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation failed', true));
  }
  // Extract image paths
  const cover = req.files?.cover?.[0]?.path;
  const gallery = req.files?.gallery?.map((file) => file.path) || [];
  if (!cover) {
    return next(new ApiError(400, 'Cover image is required'));
  }
  const gameData = {
    ...req.body,
    cover,
    gallery,
  };

  try {
    const game = await addNewGame(gameData);
    res.status(201).json({ message: 'Game added successfully', game });
  } catch (error) {
    next(error);
  }
};

export const updateGame = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation failed', true));
  }

  try {
    // Fetch existing game
    const existingGame = await Game.findById(req.params.id);
    if (!existingGame) {
      return next(new ApiError(404, 'Game not found'));
    }

    // Only allow updates to schema-defined fields
    const allowedFields = [
      'title',
      'description',
      'platform',
      'genre',
      'price',
      'stock',
      'ratings',
    ];
    const updateData = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    // Parse JSON strings if they were sent via form-data (e.g., arrays as strings)
    if (typeof updateData.platform === 'string') {
      updateData.platform = [updateData.platform];
    }
    if (typeof updateData.genre === 'string') {
      updateData.genre = [updateData.genre];
    }

    // Cover image replacement
    if (req.files?.cover?.[0]) {
      updateData.cover = req.files.cover[0].path;
    }

    // Start with the existing gallery
    let updatedGallery = [...(existingGame.gallery || [])];

    // 1. Remove specified gallery images
    if (req.body.removeGallery) {
      const toRemove = Array.isArray(req.body.removeGallery)
        ? req.body.removeGallery
        : [req.body.removeGallery];

      updatedGallery = updatedGallery.filter((img) => !toRemove.includes(img));
    }

    // 2. Append new gallery images (avoid duplicates)
    if (req.files?.gallery?.length) {
      const newGallery = req.files.gallery.map((file) => file.path);
      updatedGallery = Array.from(new Set([...updatedGallery, ...newGallery]));
    }

    updateData.gallery = updatedGallery;

    const updatedGame = await Game.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({ message: 'Game updated successfully', game: updatedGame });
  } catch (error) {
    next(error);
  }
};

export const deleteGame = async (req, res, next) => {
  try {
    await deleteGameById(req.params.id);
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    next(error);
  }
};
