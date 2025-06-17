import mongoose from 'mongoose';
import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
// import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

class OrderService {
  async placeOrder(userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Get the user's cart
      const cart = await Cart.findOne({ user: userId })
        .populate('items.game')
        .session(session);

      if (!cart || cart.items.length === 0) {
        throw new ApiError(400, 'Cart is empty');
      }

      // 2. Prepare order items and calculate total
      let totalCost = 0;
      const orderItems = [];

      for (const item of cart.items) {
        const product = item.game;

        // Check stock availability
        if (product.stock < item.quantity) {
          throw new ApiError(
            400,
            `Insufficient stock for product ${product.title}`
          );
        }

        // Update product stock
        product.stock -= item.quantity;
        await product.save({ session });

        // Prepare order item
        orderItems.push({
          game: product._id,
          quantity: item.quantity,
          priceAtPurchase: product.price,
        });

        totalCost += product.price * item.quantity;
      }

      // 3. Create the order
      const order = new Order({
        user: userId,
        items: orderItems,
        totalCost,
        status: 'pending',
      });
      await order.save({ session });

      // 4. Empty the cart
      cart.items = [];
      await cart.save({ session });

      await session.commitTransaction();
      session.endSession();

      return new ApiResponse(201, order, 'Order placed successfully');
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      if (error instanceof ApiError) {
        throw error;
      }

      // Handle database errors
      if (error.name === 'CastError') {
        throw new ApiError(400, 'Invalid game ID');
      }

      throw new ApiError(500, 'Failed to place order', false, error.stack);
    }
  }

  async getOrderHistory(userId) {
    try {
      const orders = await Order.find({ user: userId })
        .populate('items.game')
        .sort({ createdAt: -1 });

      return new ApiResponse(200, orders, 'Orders retrieved successfully');
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw new ApiError(400, 'Invalid user ID');
      }
      throw new ApiError(500, 'Failed to retrieve orders', false, error.stack);
    }
  }

  async getOrderDetails(userId, orderId) {
    try {
      const order = await Order.findOne({
        _id: orderId,
        user: userId,
      }).populate('items.game');

      if (!order) {
        throw new ApiError(404, 'Order not found');
      }

      return new ApiResponse(
        200,
        order,
        'Order details retrieved successfully'
      );
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        throw new ApiError(400, 'Invalid order ID');
      }
      throw error;
    }
  }
}

export default new OrderService();
