import Order, { find, findOne } from '../models/orderModel';
import { findOne as _findOne } from '../models/Cart';
import Product from '../models/Product';

class OrderService {
  async placeOrder(userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Get user's cart
      const cart = await _findOne({ user: userId })
        .populate('items.product')
        .session(session);
      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // 2. Prepare order items and calculate total
      let totalCost = 0;
      const orderItems = [];

      for (const item of cart.items) {
        const product = item.product;

        // Check stock availability
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        // Update product stock
        product.stock -= item.quantity;
        await product.save({ session });

        // Prepare order item
        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          priceAtPurchase: product.price,
        });

        totalCost += product.price * item.quantity;
      }

      // 3. Create order
      const order = new Order({
        user: userId,
        items: orderItems,
        totalCost,
        status: 'pending',
      });
      await order.save({ session });

      // 4. Clear cart
      cart.items = [];
      await cart.save({ session });

      await session.commitTransaction();
      session.endSession();

      return order;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async getOrderHistory(userId) {
    return find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
  }

  async getOrderDetails(userId, orderId) {
    return findOne({
      _id: orderId,
      user: userId,
    }).populate('items.product');
  }
}

export default new OrderService();
