import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    platform: [{ type: String, required: true }],

    genre: [{ type: String, required: true }],
    price: { type: Number, required: true, min: 0 },
    cover: { type: String, required: true }, // single main image (required)
    gallery: [{ type: String }],
    stock: { type: Number, default: 1, required: true },
  },
  { timestamps: true, strict: true }
);
gameSchema.index({ genre: 1 });
gameSchema.index({ platform: 1 });
const Game = mongoose.model('Game', gameSchema);
export default Game;
