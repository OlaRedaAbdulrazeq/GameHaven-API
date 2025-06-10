// controllers/orderController.js
import OrderService from '../services/orderService';
import { NotFoundError, BadRequestError } from '../utils/ApiError';

class OrderController {
  async placeOrder(req, res, next) {
    try {
      const order = await OrderService.placeOrder(req.user.id);
      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderHistory(req, res, next) {
    try {
      const orders = await OrderService.getOrderHistory(req.user.id);
      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderDetails(req, res, next) {
    try {
      const order = await OrderService.getOrderDetails(
        req.user.id,
        req.params.id
      );
      if (!order) {
        throw new NotFoundError('Order not found');
      }
      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
