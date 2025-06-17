import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import OrderController from '../controllers/orderController.js';

const router = express.Router();

router.use(protect);

router.post('/', OrderController.placeOrder);
router.get('/', OrderController.getOrderHistory);
router.get('/:id', OrderController.getOrderDetails);

export default router;
