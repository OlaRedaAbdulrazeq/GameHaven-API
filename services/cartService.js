import Cart from '../models/cartModel.js';
import Game from '../models/gameModel.js';
import ApiError from '../utils/ApiError.js';

export const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalPrice: 0 });
  }
  // Optionally populate game details if not storing them in cart item
  // await cart.populate('items.game', 'title price coverImage stock');
  return cart;
};

export const addItemToCart = async (userId, gameId, quantity) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new ApiError(404, 'Game not found');
  }
  if (game.stock < quantity) {
    throw new ApiError(
      400,
      `Not enough stock for ${game.title}. Available: ${game.stock}`
    );
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalPrice: 0 });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.game.toString() === gameId
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
    if (game.stock < cart.items[existingItemIndex].quantity) {
      throw new ApiError(
        400,
        `Cannot add ${quantity} more. Total requested exceeds stock for ${game.title}. Available: ${game.stock}`
      );
    }
  } else {
    cart.items.push({
      game: gameId,
      quantity,
      price: game.price,
      title: game.title,
      coverImage: game.cover, // ola named it cover
    });
  }
  cart.calculateTotalPrice();
  await cart.save();
  return cart;
};

export const removeItemFromCart = async (userId, gameId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.game.toString() === gameId
  );
  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }

  cart.items.splice(itemIndex, 1);
  cart.calculateTotalPrice();
  await cart.save();
  return cart;
};

export const updateCartItemQuantity = async (userId, gameId, quantity) => {
  const game = await Game.findById(gameId);
  if (!game) {
    throw new ApiError(404, 'Game not found');
  }
  if (game.stock < quantity) {
    throw new ApiError(
      400,
      `Not enough stock for ${game.title}. Available: ${game.stock}`
    );
  }
  if (quantity <= 0) {
    // To remove item if quantity is 0 or less
    return removeItemFromCart(userId, gameId);
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.game.toString() === gameId
  );
  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }

  cart.items[itemIndex].quantity = quantity;
  cart.calculateTotalPrice();
  await cart.save();
  return cart;
};

export const clearCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return null; // Or throw error if cart must exist
  }
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();
  return cart;
};
