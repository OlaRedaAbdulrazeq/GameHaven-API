import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      // Price at the time of adding to cart
      type: Number,
      required: true,
    },
    title: {
      // To display in cart without extra population
      type: String,
      required: true,
    },
    cover: {
      type: String,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

cartSchema.methods.calculateTotalPrice = function () {
  this.totalPrice = this.items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );
  return this.totalPrice;
};

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
