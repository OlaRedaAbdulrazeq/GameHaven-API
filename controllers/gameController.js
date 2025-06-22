import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  getAllGames,
  getGameById,
  addNewGame,
  updateGameById,
  deleteGameById,
} from '../services/gameService.js';
import Game from '../models/gameModel.js';
import { uploadToImgbb } from '../utils/imgbbUpload.js';

export const getGames = asyncHandler(async (req, res) => {
  const result = await getAllGames(req.query, req.user);
  res.json(new ApiResponse(200, result));
});

export const getGameByIdController = asyncHandler(async (req, res) => {
  const game = await getGameById(req.params.id);
  res.json(new ApiResponse(200, game));
});

export const addGame = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation failed', true));
  }
  const coverBuffer = req.files?.cover?.[0]?.buffer;
  const galleryBuffers = req.files?.gallery || [];

  if (!coverBuffer) {
    return next(new ApiError(400, 'Cover image is required'));
  }

  const cover = await uploadToImgbb(coverBuffer);

  const gallery = await Promise.all(
    galleryBuffers.map((file) => uploadToImgbb(file.buffer))
  );
  const gameData = {
    ...req.body,
    cover,
    gallery,
  };

  const game = await addNewGame(gameData);
  res.json(new ApiResponse(201, game, 'Game added successfully'));
});

export const updateGame = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation failed', true));
  }

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
    const newCover = await uploadToImgbb(req.files.cover[0].buffer);
    updateData.cover = newCover;
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
    const newGalleryImages = await Promise.all(
      req.files.gallery.map((file) => uploadToImgbb(file.buffer))
    );

    updatedGallery = Array.from(
      new Set([...updatedGallery, ...newGalleryImages])
    );
  }

  updateData.gallery = updatedGallery;

  const updatedGame = await Game.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.json(new ApiResponse(200, updatedGame, 'Game updated successfully'));
});

export const deleteGame = asyncHandler(async (req, res) => {
  await deleteGameById(req.params.id);
  res.json(new ApiResponse(200, [], 'Game deleted successfully'));
});
