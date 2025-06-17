import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema({
  game: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  priceAtPurchase: {
    type: Number,
    required: true,
  },
});

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  totalCost: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model('Order', orderSchema);
