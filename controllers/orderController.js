import OrderService from '../services/orderService.js';

class OrderController {
  async placeOrder(req, res, next) {
    try {
      const response = await OrderService.placeOrder(req.user.id);
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getOrderHistory(req, res, next) {
    try {
      const response = await OrderService.getOrderHistory(req.user.id);
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getOrderDetails(req, res, next) {
    try {
      const response = await OrderService.getOrderDetails(
        req.user.id,
        req.params.id
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
